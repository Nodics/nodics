# vDatabase Module

`vDatabase` is the publish/runtime variant module for the shared database capability. It allows database defaults and activation behavior to be adjusted for a runtime package without modifying the base `nDatabase/database` contracts.

Use this module for variant-level database wiring and runtime configuration only. Shared DAO behavior, schema access policies, generated CRUD, and provider-neutral lifecycle rules remain in `nDatabase/database`.

Projects should prefer layered configuration and active module selection for runtime differences. Avoid copying provider logic into this variant unless the variant owns a real override.
