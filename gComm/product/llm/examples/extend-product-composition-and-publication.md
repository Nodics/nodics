# Extend Product Composition And Publication

Use a later-loaded project `properties.js` contribution for new declarative
types:

```js
module.exports = {
    product: {
        relation: {
            types: ['ACCESSORY', 'COMPATIBLE', 'PROJECT_PREREQUISITE'],
            acyclicTypes: ['PROJECT_PREREQUISITE']
        },
        media: {
            roles: ['PRIMARY', 'GALLERY', 'PROJECT_AR_VIEW']
        }
    }
};
```

Repeat required defaults when the effective loader replaces arrays. Keep graph
limits finite and URI schemes allow-listed. Override
`DefaultProductOnlineProjectionService` in a later module to compose an
existing cache or search provider after activation or rollback.

Prefer changing `product.cache`, `product.searchProjection`, and
`product.projection` properties before overriding services. Provider choice for
`cache.product.channels.delivery` selects NodeCache, Redis, or Hazelcast
through nCache configuration; Product code must remain unchanged. Enable
search only when nSearch, the Product index, and the named indexer are active
in the Online composition.

Do not copy Unit conversion, binary storage, Workflow, `nPublish`, module-token
transport, version persistence, or Online pointer logic. Do not add a direct
Staged-to-Online database writer. Tests must cover tenant/enterprise scope,
exact quantities, graph bounds, URI rejection, manifest integrity, target
separation, idempotency, active-manifest reads, cache invalidation, search
failure recovery, reconciliation, and rollback.
