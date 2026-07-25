# AI Knowledge Runtime Operations

AI Knowledge is disabled by default. An environment must enable it through
normal Nodics configuration layering and must provide a healthy nSearch
deployment before ingestion or retrieval can be considered ready.

## Business and operator workflow

1. Create the corpus and source records through their generated Nodics
   services or an approved project setup contribution. The OOTB init import
   provides an inactive `nodicsDocumentation` corpus and the explicit
   `nodicsGDocs` source for the default tenant.
2. Submit published documents to the service-token-protected ingestion route.
   The response identifies a durable ingestion run.
3. Inspect the ingestion run and readiness endpoints. A completed run means the
   candidate chunks reached nSearch and the batch refresh completed; it still
   does not make them visible.
4. An employee with `ai.knowledge.manage` activates the candidate version.
5. Retrieval now filters every query by the corpus `activeIndexVersion`.
6. If relevance or source quality is unacceptable, roll back to an explicitly
   named previous version.

Candidate data never becomes visible merely because it was indexed. Activation
changes one corpus-owned pointer using optimistic revision matching.

## Runtime APIs

- `POST /internal/knowledge/ingest` requires the configured internal
  module-token permission.
- `POST /internal/knowledge/retrieve` requires the same module boundary and is
  intended for Assistant or other backend modules.
- `POST /operations/knowledge/activate` and `/rollback` require
  `ai.knowledge.manage`.
- `GET /operations/knowledge/readiness`, `/ingestion-runs`, and `/metrics`
  require `ai.knowledge.read`.

The OOTB bootstrap runtime administrator receives `ai.knowledge.read` and
`ai.knowledge.manage` through Profile-owned init data. Production projects
should assign these permissions to narrower operator groups according to
separation-of-duties policy.

Human passwords and employee bearer tokens are not substitutes for internal
module tokens. Internal module tokens are not accepted as employee management
authority.

## Local Elasticsearch setup

For local development, set `ELASTICSEARCH_HOME` to the extracted Elasticsearch
directory and `ES_JAVA_HOME` to a compatible JDK, then run:

```text
ES_JAVA_HOME="$ES_JAVA_HOME" \
ES_JAVA_OPTS="-Xms1g -Xmx1g" \
"$ELASTICSEARCH_HOME/bin/elasticsearch" \
-Ediscovery.type=single-node \
-Enetwork.host=127.0.0.1 \
-Ehttp.port=9200 \
-Expack.security.enabled=false
```

Disabling Elasticsearch security is permitted only on a developer-owned local
loopback interface. Shared environments must configure authentication, TLS,
secret resolution, and network policy through their deployment layer.

Enable the existing nSearch authority and AI Knowledge in the local server
layer, start Nodics, and verify:

```text
curl http://127.0.0.1:9200/_cluster/health
curl http://127.0.0.1:9200/_cat/indices?v
```

Run the explicit init import for `aiKnowledge` to install its corpus/source
records. The import is not executed every time the server starts.

## Ingestion and recovery

Every ingestion has a unique run code. The durable run progresses from
`RUNNING` to `COMPLETED` or `FAILED`. Replaying a completed run code returns the
recorded result without indexing again. Reusing a running or failed code is
rejected; choose a new run code after correcting the cause.

If document persistence succeeds but indexing fails, the candidate remains
inactive and the run becomes `FAILED`. Correct nSearch, verify readiness, and
submit a new run. Do not modify `activeIndexVersion` directly and do not write
to Elasticsearch outside nSearch.

Configured document-count and document-byte limits are enforced. Failure
messages persisted with runs are bounded and credential-shaped values are
redacted.

After all chunks in a run have been indexed, AI Knowledge invokes the generated
`KnowledgeChunk` service's nSearch refresh once for the batch. Source adapters
must not call Elasticsearch refresh directly, and must not refresh once per
chunk.

## Readiness and metrics

Readiness reports:

- whether effective configuration enables Knowledge;
- the configured search authority and search mode;
- nSearch index health;
- whether the requested corpus has an active version.

Metrics are derived from a bounded tenant-scoped window of durable ingestion
runs, so they remain valid across application processes. They report run,
document, chunk, state, and duration totals. Infrastructure-level nSearch
latency and capacity remain owned by nSearch monitoring.

Provider relevance scores are non-negative but not necessarily normalized.
For example, Elasticsearch BM25 scores may exceed `1`. Tune
`retrieval.minimumEvidenceScore` using representative corpus queries rather
than assuming a percentage.

## Developer customization

Override the smallest property subtree through project, environment, server,
node, or tenant layering. Source adapters contribute explicit documents to
`DefaultAiKnowledgeOperationsService`; they do not open database or search
connections.

The generated `KnowledgeChunk` service is the only item-to-search bridge:

- `save` persists the derived item through nDatabase;
- `doSave` indexes it through nSearch;
- `doSearch` retrieves it through nSearch.

Do not call the database-backed `DefaultSearchService` as an index client.
Vector and hybrid execution remain disabled until mappings, dimensions,
embedding profile, and adapter capability are explicitly configured.

## Verification

```text
node gAi/aiKnowledge/test/aiKnowledgeRuntimeOperationsContract.test.js
node gAi/aiKnowledge/test/aiKnowledgeRouteSecurityContract.test.js
node gFramework/nSearch/elastic/test/elasticConnectionHandlerContract.test.js
node gFramework/nSearch/elastic/test/elasticSearchModelOperationContract.test.js
node gFramework/nTooling/bin/nodics-tool.js test:suite --suite=ai
```
