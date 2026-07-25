# elastic Documentation

This folder contains permanent human-readable documentation for the `gFramework/nSearch/elastic` module boundary.

Keep architecture, runtime contracts, configuration behavior, operational notes, troubleshooting, and extension decisions here when they are too detailed for the module `README.md`.

Update this folder whenever module behavior, public contracts, security posture, lifecycle, or customization rules change.

## Elasticsearch client compatibility

The adapter owns translation between the stable Nodics connection contract and
the installed Elasticsearch JavaScript client. Existing layered configuration
may still provide `hosts`; the adapter normalizes it to `nodes` before client
construction and removes obsolete client-only properties. Do not duplicate
this translation in an application module.

Elasticsearch request parameters use their current wire names, including
`op_type`, `ignore_unavailable`, and `expand_wildcards`. Connection timeout is
configured on the client transport and the health ping sends an empty API
request. Promise-based clients and callback-based project test adapters are
both supported at this boundary.

Local qualification must prove client ping, cluster health, index creation,
indexing, refresh, filtered retrieval, and failure propagation. Local security
may be disabled only on a developer-owned loopback interface; shared
environments require TLS, authentication, and secret-managed credentials.
