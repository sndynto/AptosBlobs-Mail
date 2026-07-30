module mail_addr::registry {
    use std::string::String;
    use std::signer;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    struct ReporterReports has key {
        reported_blobs: Table<String, bool>,
    }

    #[event]
    struct ReportRegistered has drop, store {
        reporter: address,
        owner: address,
        blob_name: String,
        reason: String,
    }

    public entry fun register_report(
        reporter: &signer,
        owner: address,
        blob_name: String,
        reason: String,
    ) acquires ReporterReports {
        let reporter_addr = signer::address_of(reporter);

        if (!exists<ReporterReports>(reporter_addr)) {
            move_to(reporter, ReporterReports {
                reported_blobs: table::new(),
            });
        };

        let reports = borrow_global_mut<ReporterReports>(reporter_addr);
        table::upsert(&mut reports.reported_blobs, blob_name, true);

        event::emit(ReportRegistered {
            reporter: reporter_addr,
            owner,
            blob_name,
            reason,
        });
    }

    #[view]
    public fun has_reported(reporter: address, blob_name: String): bool acquires ReporterReports {
        if (!exists<ReporterReports>(reporter)) {
            return false
        };

        let reports = borrow_global<ReporterReports>(reporter);
        if (!table::contains(&reports.reported_blobs, blob_name)) {
            return false
        };

        *table::borrow(&reports.reported_blobs, blob_name)
    }
}
