# vMongodb Module

`vMongodb` is the publish/runtime variant module for the MongoDB adapter. It allows MongoDB provider behavior to participate in Nodics runtime activation without changing the base `mongodb` module.

Use this module for variant-specific MongoDB activation, overrides, or deployment wiring. Keep common MongoDB adapter behavior in `nDatabase/mongodb` and shared database contracts in `nDatabase/database`.

Variant configuration should remain layered and environment-specific. Do not duplicate generic MongoDB logic here unless the variant genuinely changes runtime behavior.
