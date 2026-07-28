# nMedia Agent Contract

This file gives AI coding agents mandatory guidance for the Nodics framework media capability.

## Inheritance

- Follow the root Nodics AI contract: `../../AGENTS.md`.
- Follow the framework contract: `../AGENTS.md`.

## Ownership

`gFramework/nMedia` is the framework authority for media lifecycle:

- media metadata;
- media folders and formats;
- storage provider selection;
- backend-owned storage key/path generation;
- media set and variant grouping;
- media references that other modules can use without owning files;
- media access, stream, lifecycle, and cleanup contracts.

`nMedia` does not own product, CMS, import, documentation, or storefront business meaning. Those modules reference media or media sets when they need assets.

Product-specific relationships such as primary image, thumbnail, gallery order,
swatch image, product manual, or product video belong to the Product/Catalog
owning module. `nMedia` owns the reusable set of files and variants; Product
owns why that set is attached to a product.

## Non-Negotiable Boundaries

- Do not let frontend clients provide raw filesystem paths, NAS paths, cloud bucket paths, or public URLs as authoritative storage locations.
- Do not duplicate media storage under CMS, Product, Import, Documentation, Axis, or project modules.
- Do not add a provider directly to a caller module. Add a provider implementation behind the `nMedia` provider contract.
- Do not place production provider credentials in `package.json`, sample data, tests, generated docs, or frontend repositories.
- Do not add a new upload parser or router-level body parser from inside `nMedia`. HTTP request parsing belongs to `gFramework/nRouter`; `nMedia` may consume parsed file descriptors.
- Domain modules must use the `nMedia` reference lookup contract when they need to validate a `mediaCode` or `mediaSetCode`; they must not read generated media CRUD services directly as a shortcut.

## Configuration Contract

Reusable defaults belong in `gFramework/nMedia/config/properties.js`.

Project, environment, server, node, tenant, or customer layers may override:

- active/default storage provider;
- provider enablement;
- provider base path, base URL, and internal/private URL policy;
- folder policy;
- allowed extensions and MIME types;
- maximum file size;
- generated key strategy;
- retention and cleanup behavior.
- reference lookup active status policies for media items and media sets.

Later layers must override only the values they intentionally change. Do not copy the full OOTB provider configuration into server or environment properties as placeholders.

## Implementation Order

For every media change:

1. Reuse the `nMedia` provider, folder, format, media, media set, and reference contracts.
2. Customize behavior through `properties.js`, provider services, schema overrides, or later-layer services.
3. Create a new schema/service/provider only after checking that existing contracts cannot express the requirement.

## Documentation and Test Expectations

Every media lifecycle change must update:

- `README.md` for human entry guidance;
- `llm/contracts/README.md` for AI/developer rules;
- focused tests for provider resolution, storage key safety, folder policy, and forbidden path behavior;
- canonical documentation content when the behavior is visible to administrators, developers, operators, business users, or Axis.

Tests must cover positive, negative, boundary, contract, integration-ready, and regression behavior without relying on production cloud services unless a live-provider test is explicitly marked and guarded.
