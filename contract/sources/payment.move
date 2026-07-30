module mail_addr::payment {
    use std::string::String;
    use std::signer;
    use aptos_framework::aptos_account;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    const E_PRICE_ZERO: u64 = 1;

    struct UserAccess has key {
        unlocked_blobs: Table<String, bool>,
    }

    #[event]
    struct MailUnlocked has drop, store {
        payer: address,
        owner: address,
        blob_name: String,
        price_octas: u64,
    }

    /// Pay the content owner to unlock one mail/blob.
    /// The unlock is recorded on-chain so the dapp can restore access later.
    public entry fun unlock_mail(
        payer: &signer,
        owner: address,
        blob_name: String,
        price_octas: u64,
    ) acquires UserAccess {
        assert!(price_octas > 0, E_PRICE_ZERO);

        aptos_account::transfer(payer, owner, price_octas);

        let payer_addr = signer::address_of(payer);
        if (!exists<UserAccess>(payer_addr)) {
            move_to(payer, UserAccess {
                unlocked_blobs: table::new(),
            });
        };

        let access = borrow_global_mut<UserAccess>(payer_addr);
        table::upsert(&mut access.unlocked_blobs, blob_name, true);

        event::emit(MailUnlocked {
            payer: payer_addr,
            owner,
            blob_name,
            price_octas,
        });
    }

    #[view]
    public fun has_unlocked(payer: address, blob_name: String): bool acquires UserAccess {
        if (!exists<UserAccess>(payer)) {
            return false
        };

        let access = borrow_global<UserAccess>(payer);
        if (!table::contains(&access.unlocked_blobs, blob_name)) {
            return false
        };

        *table::borrow(&access.unlocked_blobs, blob_name)
    }
}
