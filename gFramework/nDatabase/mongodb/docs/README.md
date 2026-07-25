# mongodb Documentation

This folder contains permanent human-readable documentation for the `gFramework/nDatabase/mongodb` module boundary.

Keep architecture, runtime contracts, configuration behavior, operational notes, troubleshooting, and extension decisions here when they are too detailed for the module `README.md`.

Update this folder whenever module behavior, public contracts, security posture, lifecycle, or customization rules change.

## MongoDB transaction deployment

Before enabling transactional business capabilities, run MongoDB as a replica
set or sharded cluster, configure it through normal Nodics property layering,
confirm transaction permission, and run live commit, forced rollback,
concurrency-conflict, and primary-failover tests. Monitor aborts, commit
latency, pool exhaustion, and unknown commit results.

If MongoDB reports that transactions require a replica-set member or mongos,
keep the consuming capability disabled. Never fall back to sequential writes.
