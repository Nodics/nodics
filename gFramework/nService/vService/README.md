# vService Module

`vService` is the publish/runtime variant module for the `nService` capability. It allows service behavior or activation defaults to vary by runtime package without changing the base service framework module.

Use this module for variant-level service wiring and configuration. Shared service contracts, service orchestration, and reusable service utilities belong in `nService`.

Variant changes should be minimal, layered, and test-backed. Avoid duplicating base service logic unless the runtime variant owns a deliberate override.
