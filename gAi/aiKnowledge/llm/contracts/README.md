# Knowledge Contracts

- Knowledge configuration is already merged by the Nodics configuration
  hierarchy before validation. Do not add a Knowledge-specific loader.
- Source modules explicitly contribute projections and retain data authority.
- `nSearch` remains keyword, vector, and hybrid execution authority.
- Knowledge indexes are derived, citation-backed, permission-scoped, and
  replaceable; they are never a business source of truth.
- Temporary root `docs/`, generic schema crawling, direct database access, and
  retrieval-driven writes are prohibited.
- Tenant, audience, classification, and citation enforcement cannot be disabled
  through configuration.
- Configuration snapshots must be immutable and must redact secret references.
- AI Knowledge owns evidence and embedding-workload optimization only.
  `aiProviders` owns token estimation, reservation, actual usage and cost.
- Optimization must preserve citations, source identity, tenant, audience,
  classification and publication scope.
# AI Knowledge Runtime Contract

- Use generated schema services for corpus, source, document, chunk, and
  ingestion-run persistence.
- Use `DefaultKnowledgeChunkService.doSave` and `.doSearch` for nSearch. Never
  use `DefaultSearchService` as an index client.
- Indexing creates candidates. Only the corpus `activeIndexVersion` makes one
  version retrievable.
- Activation and rollback must use tenant, corpus, and revision compare-and-set
  criteria and must reject zero affected records.
- Every indexed retrieval must include tenant, corpus, audience,
  classification, and active index version filters.
- Ingestion and retrieval HTTP routes are module-internal and service-token
  protected. Operational management routes require employee permissions.
- Completed ingestion run codes are idempotent replays. Running and failed run
  codes are not automatically replayed.
- A completed ingestion must perform one nSearch-owned refresh after the batch;
  never refresh Elasticsearch directly or once per chunk.
- Runtime code must enforce the same closed audience, classification, source,
  retrieval-mode, and search-mode values published by the API schema.
- Search relevance scores are provider-native non-negative values and are not
  assumed to be normalized to `1`.
- Persist only bounded, sanitized failure evidence. Never persist provider
  credentials, tokens, prompts, or retrieved sensitive content in diagnostics.
- Vector and hybrid modes remain fail closed until all required mappings,
  dimensions, provider profiles, and adapter capabilities are configured.
