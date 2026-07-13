# gfcms Module

`gfcms` owns content-related behavior for the `gframes` application. It provides project-specific content data, schemas, routes, pipelines, interceptors, utilities, configuration, and tests.

Use this module for `gframes` content contracts. Shared CMS platform behavior belongs in `gContent`, and generic framework behavior remains in `gFramework`.

Content changes should stay schema-driven, tenant-aware, and safe for layered overrides.
