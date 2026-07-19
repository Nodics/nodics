# workflow

`workflow` composes the application workflow modules `flowSchema`, `flowCore`, and `flowApi`. It provides the group-level configuration and activation point for workflow behavior outside the framework BPM core.

Workflow drain rejects new carrier work and waits, within the global shutdown
deadline, for tracked pipelines to settle. Durable carrier state remains the
recovery authority after hard process termination.

Workflow owns its optional BackOffice catalogue declaration in `package.json`.
The declaration is client-safe discovery metadata and never replaces flow API
authorization, schemas, or durable carrier state.

Use this module for composition and shared workflow defaults. Schema ownership belongs in `flowSchema`, runtime workflow behavior belongs in `flowCore`, and API-facing behavior belongs in `flowApi`.

Workflow changes should preserve source definitions, validation, auditability, rollback safety, and generated artifacts.

## Initial Workflow Users

Workflow initializer data may define inactive example principals for workflow
authoring and approval groups. It must not provide usable framework passwords
or API keys. Real workflow users, service accounts, and credentials belong in
the owning project/environment layer and must be supplied through governed
identity and secret handling.
