module mail_addr::access_control {
    use std::string::String;
    use std::signer;
    use std::option::{Self, Option};
    use aptos_framework::event;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::object;
    use aptos_framework::fungible_asset::Metadata;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};

    const SHELBY_USD_METADATA: address = @0x1b18363a9f1fe5e6ebf247daba5cc1c18052bb232efdc4c50f556053922d98e1;

    const E_INSUFFICIENT_BALANCE: u64 = 1;
    const E_NOT_REGISTERED: u64 = 2;
    const E_ZERO_PRICE: u64 = 4;

    const POLICY_TIMELOCK: u8 = 1;
    const POLICY_PAY_TO_DOWNLOAD: u8 = 2;

    struct BlobPolicy has store, drop {
        policy_type: u8,
        price_base_units: u64,
        timelock_micros: u64,
        owner: address,
    }

    struct PolicyRegistry has key {
        policies: Table<String, BlobPolicy>,
    }

    struct PurchaseRegistry has key {
        purchases: Table<String, bool>,
    }

    #[event]
    struct BlobRegistered has drop, store {
        owner: address,
        blob_name: String,
        policy_type: u8,
    }

    #[event]
    struct BlobPurchased has drop, store {
        buyer: address,
        owner: address,
        blob_name: String,
        price: u64,
    }

    // Decode ULEB128 u64. In Move, << requires u8 as shift amount.
    // We unroll up to 10 bytes (max for u64 ULEB128).
    fun decode_uleb128(data: &vector<u8>, pos: u64): (u64, u64) {
        let b0 = (*std::vector::borrow(data, pos) as u64);
        if (b0 & 0x80 == 0) return (b0, pos + 1);
        let r0 = b0 & 0x7f;

        let b1 = (*std::vector::borrow(data, pos + 1) as u64);
        if (b1 & 0x80 == 0) return (r0 | ((b1 & 0x7f) << 7u8), pos + 2);
        let r1 = r0 | ((b1 & 0x7f) << 7u8);

        let b2 = (*std::vector::borrow(data, pos + 2) as u64);
        if (b2 & 0x80 == 0) return (r1 | ((b2 & 0x7f) << 14u8), pos + 3);
        let r2 = r1 | ((b2 & 0x7f) << 14u8);

        let b3 = (*std::vector::borrow(data, pos + 3) as u64);
        if (b3 & 0x80 == 0) return (r2 | ((b3 & 0x7f) << 21u8), pos + 4);
        let r3 = r2 | ((b3 & 0x7f) << 21u8);

        let b4 = (*std::vector::borrow(data, pos + 4) as u64);
        if (b4 & 0x80 == 0) return (r3 | ((b4 & 0x7f) << 28u8), pos + 5);
        let r4 = r3 | ((b4 & 0x7f) << 28u8);

        let b5 = (*std::vector::borrow(data, pos + 5) as u64);
        if (b5 & 0x80 == 0) return (r4 | ((b5 & 0x7f) << 35u8), pos + 6);
        let r5 = r4 | ((b5 & 0x7f) << 35u8);

        let b6 = (*std::vector::borrow(data, pos + 6) as u64);
        if (b6 & 0x80 == 0) return (r5 | ((b6 & 0x7f) << 42u8), pos + 7);
        let r6 = r5 | ((b6 & 0x7f) << 42u8);

        let b7 = (*std::vector::borrow(data, pos + 7) as u64);
        if (b7 & 0x80 == 0) return (r6 | ((b7 & 0x7f) << 49u8), pos + 8);
        let r7 = r6 | ((b7 & 0x7f) << 49u8);

        let b8 = (*std::vector::borrow(data, pos + 8) as u64);
        if (b8 & 0x80 == 0) return (r7 | ((b8 & 0x7f) << 56u8), pos + 9);
        let r8 = r7 | ((b8 & 0x7f) << 56u8);

        let b9 = (*std::vector::borrow(data, pos + 9) as u64);
        (r8 | ((b9 & 0x7f) << 63u8), pos + 10)
    }

    // Decode u64 LE from 8 bytes
    fun decode_u64_le(data: &vector<u8>, pos: u64): (u64, u64) {
        let b0 = (*std::vector::borrow(data, pos) as u64);
        let b1 = (*std::vector::borrow(data, pos + 1) as u64);
        let b2 = (*std::vector::borrow(data, pos + 2) as u64);
        let b3 = (*std::vector::borrow(data, pos + 3) as u64);
        let b4 = (*std::vector::borrow(data, pos + 4) as u64);
        let b5 = (*std::vector::borrow(data, pos + 5) as u64);
        let b6 = (*std::vector::borrow(data, pos + 6) as u64);
        let b7 = (*std::vector::borrow(data, pos + 7) as u64);
        let value =
            b0 |
            (b1 << 8u8) |
            (b2 << 16u8) |
            (b3 << 24u8) |
            (b4 << 32u8) |
            (b5 << 40u8) |
            (b6 << 48u8) |
            (b7 << 56u8);
        (value, pos + 8)
    }

    fun read_bytes(data: &vector<u8>, pos: u64, len: u64): (vector<u8>, u64) {
        let result = std::vector::empty<u8>();
        let i = 0u64;
        while (i < len) {
            std::vector::push_back(&mut result, *std::vector::borrow(data, pos + i));
            i = i + 1;
        };
        (result, pos + len)
    }

    public entry fun register_blobs_v2(
        owner: &signer,
        registration_data: vector<u8>,
    ) {
        let owner_addr = signer::address_of(owner);

        if (!exists<PolicyRegistry>(owner_addr)) {
            move_to(owner, PolicyRegistry {
                policies: table::new(),
            });
        };

        let registry = borrow_global_mut<PolicyRegistry>(owner_addr);

        let pos = 0u64;
        let (count, new_pos) = decode_uleb128(&registration_data, pos);
        pos = new_pos;

        let i = 0u64;
        while (i < count) {
            // Decode blob name
            let (name_len, new_pos2) = decode_uleb128(&registration_data, pos);
            pos = new_pos2;
            let (name_bytes, new_pos3) = read_bytes(&registration_data, pos, name_len);
            pos = new_pos3;
            let blob_name = std::string::utf8(name_bytes);

            // Skip green_box_scheme (1 byte)
            pos = pos + 1;

            // Skip ace_bytes (ULEB128 len + bytes)
            let (ace_len, new_pos4) = decode_uleb128(&registration_data, pos);
            pos = new_pos4;
            let (_, new_pos5) = read_bytes(&registration_data, pos, ace_len);
            pos = new_pos5;

            // Decode policy_type
            let (policy_type_raw, new_pos6) = decode_uleb128(&registration_data, pos);
            pos = new_pos6;
            let policy_type = (policy_type_raw as u8);

            // Decode value (u64 LE 8 bytes)
            let (value, new_pos7) = decode_u64_le(&registration_data, pos);
            pos = new_pos7;

            let policy = if (policy_type == POLICY_PAY_TO_DOWNLOAD) {
                BlobPolicy {
                    policy_type: POLICY_PAY_TO_DOWNLOAD,
                    price_base_units: value,
                    timelock_micros: 0,
                    owner: owner_addr,
                }
            } else {
                BlobPolicy {
                    policy_type: POLICY_TIMELOCK,
                    price_base_units: 0,
                    timelock_micros: value,
                    owner: owner_addr,
                }
            };

            table::upsert(&mut registry.policies, blob_name, policy);

            event::emit(BlobRegistered {
                owner: owner_addr,
                blob_name,
                policy_type,
            });

            i = i + 1;
        };
    }

    public entry fun purchase(
        buyer: &signer,
        blob_owner: address,
        blob_name: String,
    ) acquires PolicyRegistry, PurchaseRegistry {
        let buyer_addr = signer::address_of(buyer);

        assert!(exists<PolicyRegistry>(blob_owner), E_NOT_REGISTERED);
        let registry = borrow_global<PolicyRegistry>(blob_owner);
        assert!(table::contains(&registry.policies, blob_name), E_NOT_REGISTERED);
        let policy = table::borrow(&registry.policies, blob_name);
        assert!(policy.policy_type == POLICY_PAY_TO_DOWNLOAD, E_NOT_REGISTERED);
        let price = policy.price_base_units;
        let owner = policy.owner;
        assert!(price > 0, E_ZERO_PRICE);

        let shelby_metadata = object::address_to_object<Metadata>(SHELBY_USD_METADATA);
        let buyer_balance = primary_fungible_store::balance(buyer_addr, shelby_metadata);
        assert!(buyer_balance >= price, E_INSUFFICIENT_BALANCE);
        primary_fungible_store::transfer(buyer, shelby_metadata, owner, price);

        if (!exists<PurchaseRegistry>(buyer_addr)) {
            move_to(buyer, PurchaseRegistry {
                purchases: table::new(),
            });
        };
        let purchase_registry = borrow_global_mut<PurchaseRegistry>(buyer_addr);
        table::upsert(&mut purchase_registry.purchases, blob_name, true);

        event::emit(BlobPurchased {
            buyer: buyer_addr,
            owner,
            blob_name,
            price,
        });
    }

    #[view]
    public fun check_permission(
        user: address,
        blob_owner: address,
        blob_name: String,
    ): Option<bool> acquires PolicyRegistry, PurchaseRegistry {
        if (!exists<PolicyRegistry>(blob_owner)) {
            return option::none()
        };
        let registry = borrow_global<PolicyRegistry>(blob_owner);
        if (!table::contains(&registry.policies, blob_name)) {
            return option::none()
        };
        let policy = table::borrow(&registry.policies, blob_name);

        if (policy.policy_type == POLICY_PAY_TO_DOWNLOAD) {
            if (!exists<PurchaseRegistry>(user)) {
                return option::some(false)
            };
            let purchase_registry = borrow_global<PurchaseRegistry>(user);
            option::some(table::contains(&purchase_registry.purchases, blob_name))
        } else if (policy.policy_type == POLICY_TIMELOCK) {
            let now_micros = timestamp::now_microseconds();
            option::some(now_micros >= policy.timelock_micros)
        } else {
            option::none()
        }
    }
}
