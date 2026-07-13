# elastic Module

`elastic` is the Elasticsearch engine adapter for `nSearch`. It owns Elasticsearch-specific configuration, schemas, route wiring, and pipeline hooks used by the provider-neutral search capability.

Use this module for Elastic connection and engine behavior only. Shared search APIs, cache policy, fallback semantics, and index lifecycle contracts belong in `nSearch/search`.

Endpoints, credentials, index names, and deployment topology must come from layered configuration. Keep this adapter replaceable by preserving the engine contract.
