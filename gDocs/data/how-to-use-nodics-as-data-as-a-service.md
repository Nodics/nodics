# How To Use Nodics As Data As A Service

Data as a Service, or DaaS, is a Nodics platform pattern. It is not a separate module that must exist by that name.

In Nodics, DaaS means using the platform as a governed data lake, data hub, or product information center. Data can enter from many sources, move through validation and transformation, become searchable and versioned where required, and then leave through export contracts that match each target system.

## What DaaS Means In Nodics

DaaS combines multiple Nodics capabilities:

- schemas for canonical data shape;
- tenants for company or customer separation;
- catalogs for domain-specific organization;
- import definitions for source-system intake;
- export definitions for target-system delivery;
- validators and interceptors for data quality;
- pipelines for ordered transformation;
- events for downstream reactions;
- services and facades for business behavior;
- search indexes for retrieval;
- runtime governance for controlled activation, audit, and rollback;
- provider modules for databases, messaging, cache, search, files, and external systems.

The value is not one API endpoint. The value is a governed data platform that keeps source data, normalized data, business-ready data, and exported data under clear ownership.

## Business Use Case: Product Catalog Information Center

A strong DaaS use case is a Product Catalog Information Center.

In this model, Nodics manages product catalog data for multiple companies, multiple business lines, and multiple consuming systems.

Example:

- One tenant represents Company A.
- Another tenant represents Company B.
- Each tenant may manage catalogs for electronics, apparel, groceries, spare parts, or other product domains.
- Product data may arrive from ERP, supplier files, PIM systems, spreadsheets, APIs, events, or manual imports.
- Nodics validates, normalizes, enriches, classifies, indexes, and governs that data.
- Target systems receive exports shaped to their own contract, such as ecommerce storefronts, marketplaces, ERP systems, analytics platforms, or partner feeds.

The same canonical product data can serve many applications without forcing every application to own its own copy of the import, validation, enrichment, and export logic.

## Source Data Intake

DaaS starts with controlled data intake.

Source systems can provide data through:

- JSON files;
- CSV files;
- Excel files;
- JavaScript data definitions;
- APIs;
- message streams;
- remote import adapters;
- scheduled jobs;
- manually triggered imports.

Every import flow identifies:

- the owning module;
- the source format;
- the tenant or company receiving the data;
- the target schema;
- the header and field mapping;
- the validation rules;
- the duplicate and idempotency behavior;
- the diagnostics and run history;
- the rollback or recovery expectation.

Do not treat imported files as trusted just because they came from a known system. Import flows must validate structure, required fields, tenant ownership, duplicate headers, target schema, target operation, and processor behavior before mutation.

## Data Feeding Patterns

DaaS implementations usually receive data in two ways.

### External Systems Push Data To Nodics

In this pattern, the external system calls Nodics import services and pushes data into the platform.

Use this when the source system should decide when the data is ready.

Examples:

- ERP pushes product, price, or inventory updates;
- supplier system pushes catalog records;
- marketplace application pushes order or product status;
- business application pushes customer or account data;
- admin tool uploads an approved import payload.

The data still enters the Nodics import pipeline. Filters, validators, processors, interceptors, tenant resolution, access policy, events, search indexing, diagnostics, and import history remain owned by Nodics.

### Nodics Pulls Or Picks Up Files

In this pattern, the source system places files in a governed location and Nodics imports them through a scheduled process.

Use this when the source system produces batch files, cannot call Nodics APIs, or needs a periodic exchange.

Examples:

- supplier CSV files are placed in a configured import folder;
- ERP exports Excel files every night;
- product catalog JSON files are placed in a governed Nodics import location;
- JavaScript data definition files are placed in module-owned data folders;
- a CronJob periodically triggers the import service for pending files.

The same import pipeline processes the files after Nodics picks them up. This keeps validation, transformation, audit, tenant isolation, and downstream events consistent with push-based imports.

When direct remote pull from external locations is required, remote import adapters can stage files from SFTP, object storage, partner API, HTTPS pull, or enterprise file gateway before the normal import pipeline runs. That adapter remains a governed project or provider responsibility and must not become a generic open framework endpoint.

## Production Remote Import Adapter Gate

Remote import is a governed extension path for direct-pull data intake. It is not an open endpoint where a caller can provide arbitrary URLs, credentials, or executable definitions.

The framework keeps remote import disabled by default. A project, provider, environment, server, or tenant layer must explicitly register the source and transport configuration before remote import can run.

A production remote import adapter must:

- be owned by a clear project or provider module;
- implement the standard adapter service contract;
- stage only data files in the server-owned staging location;
- return file descriptors with SHA-256 checksums;
- keep endpoints, credentials, tokens, and secret paths in governed configuration or secret storage;
- enforce tenant, module, and source allowlists;
- respect timeout, retry, file-count, file-size, total-size, extension, checksum, and cleanup policies;
- produce sanitized diagnostics and import run history;
- prove deterministic behavior through contract tests;
- prove live behavior through guarded integration or release tests before any public route is exposed.

Supported adapter examples can include SFTP, object storage, partner APIs, HTTPS pull, message-backed file drops, or enterprise file gateways. The adapter choice belongs to the project or provider layer because each production source has different authentication, contract, retry, latency, and audit expectations.

Remote input may provide source data. It must not provide schema definitions, router definitions, service code, executable configuration, or generated artifacts. Headers and processing rules must still come from trusted active Nodics modules.

## Canonical Data Model

DaaS needs a canonical model that represents the business truth inside Nodics.

For product catalog data, the canonical model may include:

- product identity;
- product family;
- category or catalog hierarchy;
- attributes;
- media references;
- pricing references;
- inventory references;
- classification data;
- localization data;
- approval or publish state;
- source-system traceability;
- target-system export status.

Schemas define this model. Generated APIs, services, validators, search indexes, import/export behavior, and tests come from those source definitions.

If one company, tenant, catalog, or application needs additional fields, use layered schema extension through the owning project or tenant layer. Do not hardcode one customer's product model into a reusable framework module.

## Tenant And Catalog Separation

Tenants separate company or customer boundaries.

Catalogs separate business domains, product domains, or application-facing data areas inside those boundaries.

For example:

- Company A can own an electronics catalog and an apparel catalog.
- Company B can own a spare-parts catalog.
- A marketplace application can consume a subset of approved products.
- A storefront can consume another subset with storefront-specific attributes.
- An analytics system can receive an enriched export with additional classification fields.

Tenant context protects data ownership. Catalog structure organizes business meaning. Both must be visible in schemas, import definitions, export definitions, search indexes, permissions, and tests.

## Data Validation And Enrichment

Imported data usually needs more than field mapping.

Nodics can validate and enrich data through:

- schema validation;
- import processors;
- validators;
- interceptors;
- services;
- pipelines;
- events;
- reference-data lookups;
- catalog classification;
- duplicate detection;
- source-system traceability.

Examples:

- Normalize supplier color names into a controlled color catalog.
- Map source categories into the tenant's catalog hierarchy.
- Reject products without required identifiers.
- Enrich products with derived attributes.
- Validate media references.
- Mark records for manual review when confidence is low.
- Emit events after successful import or approval.

Validation and enrichment logic belongs in owned services, processors, validators, interceptors, or pipelines. Do not hide transformation rules in one-off scripts or generated output.

## Pipeline, Interceptor, And Event Flow

DaaS is process-oriented.

A product import may flow like this:

1. Receive source file or source payload.
2. Resolve tenant and target catalog.
3. Validate header and schema mapping.
4. Parse records.
5. Normalize source fields.
6. Validate required business rules.
7. Enrich with reference data.
8. Save staged records.
9. Run interceptors for lifecycle checks.
10. Emit events for indexing, approval, workflow, or export readiness.
11. Record import diagnostics and run history.

Pipelines define ordered process behavior. Interceptors protect lifecycle points. Events allow other modules to react without forcing every step into one service method.

## Search And Retrieval

DaaS data must be easy to retrieve.

Nodics search indexes can support:

- product lookup;
- catalog browsing;
- attribute filtering;
- tenant-specific search;
- target-system export selection;
- diagnostics and review queues;
- business-user search for data stewardship.

Search index definitions belong to the module that owns the searchable data. Search provider details belong behind provider modules and layered configuration.

## Export Contracts

DaaS becomes valuable when it can serve many target systems.

Each export flow defines:

- target system;
- target format;
- target schema or contract;
- field mapping;
- transformation processor;
- tenant and catalog scope;
- filtering rules;
- validation before export;
- retry behavior;
- diagnostics;
- run history;
- rollback or recovery behavior.

For example, the same canonical product record may be exported differently:

- ecommerce storefront export with display attributes and media;
- ERP export with inventory and financial identifiers;
- marketplace export with channel-specific category mapping;
- analytics export with enriched classification attributes;
- partner feed export with only approved public fields.

Export processors are responsible for matching target contracts. Do not change the canonical model just to satisfy one target system. Add or override export processors, field mappings, configuration, or project-layer services for the target.

## Runtime Governance

DaaS changes often affect many records and many consuming systems.

Use runtime governance when a change needs:

- preview;
- approval;
- activation;
- audit;
- rollback;
- diagnostics;
- tenant-specific behavior;
- controlled export activation;
- business-user review.

Runtime governance is useful for catalog activation, publish flows, runtime configuration, export rule changes, source mapping changes, and data quality policy changes.

## Security And Audit

DaaS must protect data boundaries.

Important controls include:

- authenticated import/export APIs;
- permissioned mutation routes;
- tenant-scoped data access;
- schema access policy;
- sanitized diagnostics;
- credential-free logs;
- import/export run history;
- approval and rollback records;
- target-system credential governance;
- integration release gates for live providers.

Never put credentials, tenant secrets, endpoint secrets, or target-system tokens in source-controlled files.

## Implementation Checklist

When designing a DaaS flow, define:

- owning module or project module;
- canonical schema;
- tenant and catalog model;
- import source and format;
- remote import adapter and production gate, when external source pull is required;
- import processor;
- validation rules;
- enrichment rules;
- pipeline or interceptor flow;
- events emitted;
- search indexes;
- export targets;
- export processors;
- runtime governance requirements;
- permissions and access policy;
- diagnostics and run history;
- rollback or recovery behavior;
- tests for default and project-specific behavior.

## What To Avoid

Avoid:

- creating a `daas` module just because the business pattern is called DaaS;
- forcing DaaS behavior into one generic service;
- hardcoding one source-system contract into framework import logic;
- hardcoding one target-system contract into the canonical model;
- bypassing tenant context;
- importing data without diagnostics;
- exporting data without target-contract validation;
- making external provider behavior required for basic tests;
- editing generated artifacts manually;
- treating the Postman DaaS reference as a missing framework module.

## Related Guides

- [How To Work With Data](how-to-work-with-data.md)
- [How Platform Capabilities Work](../platform/how-platform-capabilities-work.md)
- [How Configuration Works](../configuration/how-configuration-works.md)
- [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
