# cms Module

`cms` owns content-management capability behavior. It provides the module space for CMS data, schemas, routes, services, pipelines, interceptors, utilities, and tests.

Use this module for reusable content structures and content lifecycle behavior. Workflow-specific content behavior belongs in `gContent/wcms`.

Content definitions remain schema-driven and tenant-aware so projects can extend CMS behavior without changing shared module code.

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

The CMS module owns generic content contracts. Project modules own
project-specific content types, templates, and sample/core data.

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
