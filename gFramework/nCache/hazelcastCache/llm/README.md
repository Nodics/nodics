# hazelcastCache LLM Context

This folder contains module-owned LLM context for `hazelcastCache`.

Human-authored files in this folder should explain module intent, ownership, extension rules, runtime contracts, and project customization guidance. Generated files must stay under `generated/` and are recreated from Nodics source definitions during build.

Recommended use:

1. Read `gSetup/llm/README.md` first for global Nodics rules.
2. Read this module context before changing `hazelcastCache`.
3. Read `generated/module-context.md`, `generated/schemas.md`, and `generated/tests.md` for current source-derived facts.
4. For project-specific overrides, read the later module layer before changing out-of-the-box Nodics code.

Do not hardcode this module into framework behavior. Use active modules, layered configuration, schemas, runtime governance, and tenant context.

The provider uses the official `hazelcast-client`, implements the nCache distributed map/TTL/consume/invalidation contract, and remains disabled by default. The guarded contract passed against a temporary Hazelcast 5.6 member on 2026-07-21; every deployment must repeat it against its target cluster before production activation. Business modules must call `DefaultCacheService`, never this provider directly.
