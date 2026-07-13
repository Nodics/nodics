# vquiz Module

`vquiz` is the runtime variant module for quiz behavior. It allows quiz defaults or activation behavior to vary by runtime package without changing the base `quiz` module.

Use this module for variant-level quiz wiring and configuration. Keep reusable quiz capability behavior in `quiz` and workflow behavior in `wquiz`.

Variant changes should be minimal, layered, and test-backed so runtime differences stay explicit.
