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

## Capability

`nCatalog` provides:

- generated catalog schema, service, router, and CRUD/API contracts;
- catalog bootstrap data for default product and content catalogs;
- sample catalog hierarchy data;
- `subCatalogs` reference metadata;
- access group defaults for content and employee users;
- sub-catalog resolution through `DefaultSubCatalogsResolveInterceptorService`;
- catalog pipeline, interceptor, utility, enum, and status extension slots;
- focused catalog capability tests.

The framework catalog is intentionally generic. It can support product catalogs, content catalogs, tenant catalogs, application catalogs, or other domain catalogs without forcing one customer data model into the framework.

## Runtime Flow

1. Catalog schema metadata generates service, router, controller, facade, and tests.
2. Init data creates default product and content catalog records.
3. Sample data can create richer catalog hierarchy for development or demos.
4. Catalog reads may resolve active sub-catalogs through the resolver service.
5. Project modules add domain-specific catalog schemas, search indexes, import/export headers, and publish/versioning behavior.

## DaaS And Catalog Use Case

Catalog is a strong foundation for Data as a Service scenarios. A project can manage a tenant-specific product or content catalog inside Nodics, import data from many sources, validate and transform it through pipelines/interceptors, index it for search, and export target-specific feeds to external systems.

For example, a product catalog information center can manage catalogs for multiple companies and applications, then export each target system's contract through governed export processors.

## Tests

Run:

```bash
node gFramework/nCatalog/test/catalogCapabilityContract.test.js
npm run quality:docs
```

Generated catalog API/schema/CRUD tests also validate the generated surface.

## What To Avoid

Avoid:

- hardcoding one product model, pricing model, inventory model, or rendering model into `nCatalog`;
- resolving catalog hierarchy without tenant and access context;
- editing generated catalog artifacts manually;
- mixing publish lifecycle behavior into catalog unless the business module owns it;
- bypassing import/export/search contracts for catalog data movement.
