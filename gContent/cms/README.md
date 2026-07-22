# cms Module

`cms` owns content-management capability behavior. It provides the module space for CMS data, schemas, routes, services, pipelines, interceptors, utilities, and tests.

Use this module for reusable content structures and content lifecycle behavior. Workflow-specific content behavior belongs in `gContent/wcms`.

Content definitions remain schema-driven and tenant-aware so projects can extend CMS behavior without changing shared module code.

CMS owns its optional BackOffice catalogue declaration in layered `properties.js`.
BackOffice may expose that client-safe metadata to authorized users, while CMS
remains authoritative for content schemas, permissions, and operations.
CMS declares its UI-composition provider role and non-executable default site,
catalogue, page, and recovery identifiers there. BackOffice discovers CMS
operations from the existing effective System OpenAPI contract; it does not
copy or edit CMS schema authority.

The default UI-composition identifiers are deliberately CMS-generic. Consumer
or project modules contribute their own site, catalog, page, route, template,
and content data instead of embedding application identity in reusable CMS.

CMS also exposes `POST /references/sites/resolve` as a service-token-only,
bounded Site reference intent. Store uses this contract when it creates a
Store-to-Site binding in a modular deployment; co-hosted deployments use the
same CMS authority through the generated Site service. The projection contains
only Site code, name, and catalog code. Human login and generic CMS schema
routes are not an alternative module-authentication path.

## CMS Capability Model

CMS owns reusable content structures such as sites, pages, components,
component details, type codes, renderer mappings, schemas, routes, services,
data, and tests.

Model content as data, not hardcoded views. A project can define
new component types, page structures, renderer mappings, sample content, or
site-specific content through project modules and data imports.

## Content Templating

Content templating separates:

- content records;
- component type definitions;
- renderer mappings;
- page composition;
- site/tenant visibility;
- workflow or publish lifecycle where applicable.

CMS now provides backend contracts for page routes, page templates, template
slots, logical component types, ordered component associations, and logical
renderer keys. Renderer keys are declarative identifiers such as
`component.hero-banner`; executable paths, URLs, and scripts are rejected.
The existing `cmsTypeCode` model remains the single page/component type
authority and carries the declarative type contract; CMS does not introduce a
parallel component-type registry.

## Resolved Page Delivery

CMS provides two versioned delivery routes:

- `GET /nodics/cms/delivery/pages/resolve` for explicitly public Online content;
- `GET /nodics/cms/delivery/pages/resolve/authenticated` for content requiring
  the `cms.delivery.authenticated.read` permission.

Both routes require `site` and an absolute application `path`. Optional
`locale` and `channel` values use layered CMS defaults. Resolution remains
tenant-aware, disables generic recursive reads, batches each graph level, and
enforces configurable depth and component-count limits. Responses expose a
client-safe contract rather than persistence or authoring metadata.

Resolved responses use the existing Nodics router-cache authority. Page, route,
component, and association mutations invalidate the tenant's CMS delivery
resource through `DefaultCacheService`, including existing cross-node cache
propagation behavior.

See `docs/content-delivery-contract.md` for the schema, security, extension,
and operational contract.

## Immutable Publication Manifests

CMS contributes an optional immutable publication-manifest integration for
`nPublish`. When `cms.publication.enabled` is selected, activation freezes exact
route, page, association, component, template, and slot versions, then switches
an optimistic Online pointer inside a separately deployed target CMS runtime.
Staged sends an integrity-protected release through the configured authenticated
module transport; it never writes the Online database directly. Delivery serves
only the target manifest snapshot and rollback restores a target-deployed prior
manifest without creating a parallel CMS lifecycle.

Deployment layers explicitly select `cms.publication.runtimeRole` as `STAGED`
or `ONLINE`. A Staged process activates publish/version variants and versioned
CMS schema overrides. An Online process keeps `publishEnabled: false`, uses
non-versioned schemas, and stores imported manifests in a separate database.

See `docs/publication-manifest-contract.md` for authority, migration, extension,
and fail-closed delivery behavior.

For a beginner-friendly business journey, configuration examples,
customization path, operations checklist, and verification commands, read
[`gDocs/content/how-to-approve-and-publish-content.md`](../../gDocs/content/how-to-approve-and-publish-content.md).

The CMS module owns generic content contracts. Project modules own
project-specific content types, templates, and sample/core data.

## Initial Users

CMS initializer data may define inactive example principals that show which
groups own CMS work. It must not ship usable default passwords or API keys.
Projects that need real CMS users should activate and credential those users in
their own project/environment layer through governed identity and secret
handling.

## Extension And Governance

When changing CMS behavior, document:

- schema and route impact;
- content import/export behavior;
- tenant or site visibility;
- renderer/type-code mapping changes;
- workflow or publish impact;
- generated API/test impact;
- override path for project modules.

Do not put one project website's content or renderer assumptions into reusable
CMS framework behavior.

## Focused Tests

Run `node gContent/cms/test/cmsContentDeliveryContract.test.js`,
`node gContent/cms/test/cmsSiteReferenceContract.test.js`, and
`node gContent/cms/test/cmsPublicationManifestContract.test.js` before broader
generated and integration suites. CMS contract upgrades use secured
`/migration/preview`, `/migration/apply`, and `/migration/rollback` operations.
Preview never mutates data; apply is versioned and audited; repeat execution is
idempotent. Routes are created only from explicit layered mappings, and primary
identifier changes are reported for cascade review rather than renamed blindly.

Run `node gContent/cms/test/cmsMigrationContract.test.js` for the migration
change-set contract.
