# Knowledge Configuration Example

A later project or environment layer may contribute:

```js
module.exports = {
    aiKnowledge: {
        enabled: true,
        embeddingProfile: 'projectKnowledgeEmbedding'
    }
};
```

This is an override fragment, not a replacement configuration. Sources must be
explicit owner-module contributions; do not enable generic schema crawling or
create a second search engine.
# Safe Knowledge Extension Example

A project source adapter should obtain records through the owning module's
public service, project them into the documented ingestion contract, and call
the AI Knowledge internal ingestion API with a stable run code.

It must not:

- inspect arbitrary schemas;
- connect directly to MongoDB or Elasticsearch;
- write `activeIndexVersion`;
- invoke OpenAI, Anthropic, Gemini, or another vendor directly;
- retry a failed run with the same run code.

After a completed candidate run, an authorized operator activates its
`indexVersion`. Retrieval remains pinned to the previously active version until
that activation succeeds.
