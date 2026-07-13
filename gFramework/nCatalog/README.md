# nCatalog

`nCatalog` provides framework-level catalog capability support. It owns catalog schemas, generated API/CRUD contracts, catalog pipeline hooks, and sub-catalog resolution behavior.

Use this module for generic catalog behavior that should be available to applications and customer projects. Product-specific catalog modeling belongs in project or domain modules layered above the framework.

Catalog changes must preserve schema generation, validation, access control, tenant context, and regeneration of derived artifacts.
