# workflow

`workflow` composes the application workflow modules `flowSchema`, `flowCore`, and `flowApi`. It provides the group-level configuration and activation point for workflow behavior outside the framework BPM core.

Use this module for composition and shared workflow defaults. Schema ownership belongs in `flowSchema`, runtime workflow behavior belongs in `flowCore`, and API-facing behavior belongs in `flowApi`.

Workflow changes should preserve source definitions, validation, auditability, rollback safety, and generated artifacts.
