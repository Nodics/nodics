# nCatalog

`nCatalog` provides framework-level catalog capability support. It owns catalog schemas, generated API/CRUD contracts, catalog pipeline hooks, and sub-catalog resolution behavior.

Use this module for generic catalog behavior available to applications and customer projects. Product-specific catalog modeling belongs in project or domain modules layered above the framework.

Catalog changes must preserve schema generation, validation, access control, tenant context, and regeneration of derived artifacts.

## Catalog Capability Model

Catalog is a reusable business structure for organizing product, content, or
domain records that need consistent lookup, hierarchy, publication, search, and
tenant behavior.

Framework-level catalog behavior stays generic. A customer project can
define product-specific catalog types, attributes, pricing, inventory,
eligibility, or rendering behavior in project/domain modules layered above
`nCatalog`.

Catalog documentation identifies:

- catalog schema ownership;
- hierarchy or sub-catalog behavior;
- tenant and customer visibility;
- search/index impact;
- import/export behavior;
- generated API behavior;
- validation and access policy;
- publish/versioning expectations where applicable.

## Extension Path

Projects extend catalog behavior through:

- schema definitions and schema overrides;
- catalog services and facades;
- search indexes;
- import/export data;
- route configuration;
- runtime governance for controlled activation where applicable;
- tests proving default and project-specific behavior.

Do not hardcode one project's product model into `nCatalog`.
