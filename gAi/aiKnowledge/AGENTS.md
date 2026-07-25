# Knowledge Agent Contract

## Inheritance

- Follow the root Nodics contract: `../../AGENTS.md`.
- Follow the `gAi` contract: `../AGENTS.md`.
- Follow global guidance: `../../gSetup/llm/README.md`.

## Capability Boundary

- Knowledge owns reusable corpus, source, manifest, document, chunk, index
  activation, retrieval evidence, and citation contracts.
- Authoritative modules own their data and explicit knowledge projections.
  Knowledge indexes are derived and never become a business source of truth.
- `nSearch` owns keyword, vector, and hybrid search execution. Do not add a
  parallel index engine or search loader here. `aiKnowledge` owns the logical
  corpus active-version pointer; every indexed retrieval must filter by that
  pointer so candidate chunks cannot leak.
- Persistent Knowledge entities use generated schema item services. Search
  indexing and retrieval use the generated `KnowledgeChunk` service's nSearch
  capabilities; never use the database-backed `DefaultSearchService` as an
  index client.
- Retrieval strategy (`INDEXED`, `LIVE`, `HYBRID`) and search execution mode
  (`LEXICAL`, `VECTOR`, `HYBRID`) are separate contracts and must not share one
  configuration property.
- Vector and hybrid modes must fail closed until vector dimensions, mappings,
  embedding profiles, and adapter capability are explicitly configured.
- AI Knowledge calls only the `aiProviders` gateway for embeddings or other
  model capabilities. It must not select or invoke an individual vendor.
- `gDocs`, CMS, and contributing modules retain publication and source
  authority. Temporary root `docs/` is never a runtime knowledge source.
- Generic schema crawling, direct database reads, retrieved-content writes,
  and embedding of sensitive fields are prohibited by default.
- All source, chunking, embedding, retrieval, lifecycle, audience, locale,
  version, and policy choices must be layered, validated configuration.
- Configuration may narrow access but may not weaken tenant, audience,
  classification, citation, or source-authority boundaries.
- Citation locators are evidence, not automatically trusted browser links.
  Only Knowledge may classify a locator as navigable. The default contract
  permits validated same-application paths and leaves arbitrary, scheme-based,
  protocol-relative, backslash, and control-character locators non-navigable.
