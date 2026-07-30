module mail_addr::mail_registry_v2 {
    use std::string::String;
    use std::signer;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_std::table::{Self, Table};

    // Error codes
    const E_ALREADY_REGISTERED: u64 = 1;

    struct Registry has key {
        handles: Table<String, address>,
        address_to_handle: Table<address, String>,
        premium_users: Table<address, bool>,
        handle_events: EventHandle<HandleRegistered>,
    }

    struct HandleRegistered has drop, store {
        user: address,
        handle: String,
    }

    // Fungsi untuk inisialisasi registry
    public entry fun init_registry(admin: &signer) {
        if (!exists<Registry>(signer::address_of(admin))) {
            move_to(admin, Registry {
                handles: table::new(),
                address_to_handle: table::new(),
                premium_users: table::new(),
                handle_events: account::new_event_handle<HandleRegistered>(admin),
            });
        }
    }

    // Mendaftarkan handle
    public entry fun register_handle(user: &signer, handle: String) acquires Registry {
        let addr = signer::address_of(user);
        let registry = borrow_global_mut<Registry>(@mail_addr);
        
        assert!(!table::contains(&registry.handles, handle), E_ALREADY_REGISTERED);
        
        table::add(&mut registry.handles, handle, addr);
        table::upsert(&mut registry.address_to_handle, addr, handle);
        
        event::emit_event(&mut registry.handle_events, HandleRegistered {
            user: addr,
            handle,
        });
    }

    // Upgrade ke premium
    public entry fun upgrade_to_premium(user: &signer) acquires Registry {
        let addr = signer::address_of(user);
        let registry = borrow_global_mut<Registry>(@mail_addr);
        
        if (table::contains(&registry.premium_users, addr)) {
            table::upsert(&mut registry.premium_users, addr, true);
        } else {
            table::add(&mut registry.premium_users, addr, true);
        };
    }

    // Fungsi View untuk mengecek status
    #[view]
    public fun resolve_handle(handle: String): address acquires Registry {
        let registry = borrow_global<Registry>(@mail_addr);
        *table::borrow(&registry.handles, handle)
    }

    #[view]
    public fun get_handle(addr: address): String acquires Registry {
        let registry = borrow_global<Registry>(@mail_addr);
        if (table::contains(&registry.address_to_handle, addr)) {
            *table::borrow(&registry.address_to_handle, addr)
        } else {
            std::string::utf8(b"")
        }
    }

    #[view]
    public fun is_premium(addr: address): bool acquires Registry {
        let registry = borrow_global<Registry>(@mail_addr);
        if (table::contains(&registry.premium_users, addr)) {
            *table::borrow(&registry.premium_users, addr)
        } else {
            false
        }
    }
}
