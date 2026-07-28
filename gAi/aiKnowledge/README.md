# AI Knowledge

AI Knowledge is the reusable Nodics backend boundary for governed corpus
ingestion, retrieval evidence, and citations. The first implemented slice
defines version 1 source/retrieval contracts and validates the effective
layered configuration used by later source, embedding, and search adapters.

The implemented documentation vertical slice accepts explicit published
documents, creates deterministic documents/chunks, optionally obtains
embeddings only through `aiProviders`, sends derived chunks to nSearch through
the generated `KnowledgeChunk` service, and returns
tenant/audience/classification/active-version-filtered evidence with citations.
It remains disabled until a deployment selects sources and active dependencies.

## Current contracts

- tenant, enterprise, project, audience, locale, version, and classification
  scope;
- explicit module-owned source contributions;
- indexed, live, and hybrid retrieval requests;
- bounded evidence and citation records;
- sufficient/insufficient evidence responses;
- fail-closed source, search-authority, citation, isolation, and read-only
  configuration rules;
- immutable, secret-safe effective configuration snapshots.
- generated-service corpus/source/document/chunk persistence;
- section chunking, content hashes, unchanged-content identities, and candidate
  index versions;
- generated item models for corpus, source, document, and chunk persistence;
- a first-class `KnowledgeChunk` search model owned and executed by nSearch;
- corpus-owned optimistic activation and rollback of the active index version;
- durable ingestion-run status with bounded sanitized failure evidence;
- service-token-protected ingestion and retrieval APIs;
- employee-permission-protected activation, rollback, readiness, history, and
  metrics APIs;
- separate retrieval-strategy (`INDEXED`, `LIVE`, `HYBRID`) and search-mode
  (`LEXICAL`, `VECTOR`, `HYBRID`) contracts;
- citation-preserving insufficient-evidence refusal.

Retrieved citations classify only validated same-application paths as
`INTERNAL_ROUTE`. Protocol-relative, scheme-based, backslash, control-character,
and otherwise untrusted locators remain `NONE` and must be displayed as
evidence text rather than browser links. Projects may narrow this rule but must
not move navigation trust decisions into Axis.
- an inactive OOTB `nodicsDocumentation` corpus and explicit `nodicsGDocs`
  source registration, installed only by the governed init-data import;
- one nSearch refresh after each completed ingestion batch, so completion means
  the candidate is searchable without refreshing once per chunk.

The implemented search mode is lexical. Vector and hybrid search are
fail-closed until a deployment explicitly configures a compatible vector
mapping, dimensions, provider embedding profile, and nSearch adapter
capability. Embedding arrays are not silently treated as vector indexes.

`nSearch` remains the search execution authority. `aiKnowledge` owns only the
logical corpus version pointer used to filter derived search records. Source modules remain data
and publication authorities. Temporary root `docs/`, generic schema crawling,
direct database reads, and retrieval-driven writes are prohibited.

Elasticsearch relevance scores are provider-native non-negative values; they
are not normalized to a maximum of `1`. Configure the minimum evidence score
against the active nSearch provider and corpus.

## Configuration and customization

Override only the smallest required values below `aiKnowledge` through the normal
Nodics layering hierarchy. Source and model data must be contributed explicitly
by the owning module. AI Knowledge stores only an `aiProviders` usage-profile
code. Provider selection, adapters, models, and credentials belong to
`aiProviders`.

Run the focused contract test:

```text
node gAi/aiKnowledge/test/aiKnowledgeContractAndConfiguration.test.js
node gAi/aiKnowledge/test/aiKnowledgeVerticalSliceContract.test.js
node gAi/aiKnowledge/test/aiKnowledgeSearchModelAlignmentContract.test.js
node gAi/aiKnowledge/test/aiKnowledgeRuntimeOperationsContract.test.js
node gAi/aiKnowledge/test/aiKnowledgeRouteSecurityContract.test.js
```

See Runtime operations (canonical documentation: `capability.ai.technical-reference`) for beginner, operator, security,
recovery, customization, and troubleshooting guidance.
