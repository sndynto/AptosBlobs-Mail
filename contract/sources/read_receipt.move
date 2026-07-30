module mail_addr::read_receipt {
    use std::string::String;
    use std::signer;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    struct ReaderReceipts has key {
        read_blobs: Table<String, bool>,
    }

    #[event]
    struct MailRead has drop, store {
        reader: address,
        owner: address,
        blob_name: String,
    }

    public entry fun mark_read(
        reader: &signer,
        owner: address,
        blob_name: String,
    ) acquires ReaderReceipts {
        let reader_addr = signer::address_of(reader);

        if (!exists<ReaderReceipts>(reader_addr)) {
            move_to(reader, ReaderReceipts {
                read_blobs: table::new(),
            });
        };

        let receipts = borrow_global_mut<ReaderReceipts>(reader_addr);
        table::upsert(&mut receipts.read_blobs, blob_name, true);

        event::emit(MailRead {
            reader: reader_addr,
            owner,
            blob_name,
        });
    }

    #[view]
    public fun has_read(reader: address, blob_name: String): bool acquires ReaderReceipts {
        if (!exists<ReaderReceipts>(reader)) {
            return false
        };

        let receipts = borrow_global<ReaderReceipts>(reader);
        if (!table::contains(&receipts.read_blobs, blob_name)) {
            return false
        };

        *table::borrow(&receipts.read_blobs, blob_name)
    }
}
