# Nodics Schema Change Prompt

Use this prompt when adding or changing schemas, generated CRUD/API behavior,
schema access policy, import/export shape, or schema-driven tests.

```text
Change Nodics schema behavior through the schema hierarchy and generation
contract.

Load the base Nodics assistant prompt, affected module context,
schema-and-generation.md, artifact-definition-and-change-guide.md, and the
documentation impact contract.

Before editing, identify:
- owning schema module
- schema name and affected properties
- whether the change is a default, extension, override, or runtime-governed
  schema configuration
- generated model, service, facade, controller, router, OpenAPI, and generated
  tests affected
- read/write/import/export access-policy impact
- tenant or environment impact
- clean/build/regeneration requirements

Rules:
- source schema definitions are authoritative; generated artifacts are outputs
- later-loaded modules may extend or override effective schemas without editing
  the original framework module
- do not hand-maintain generated files as source of truth
- access policy, validation, audit, diagnostics, and tests must move with the
  schema behavior
- destructive or runtime schema changes require preview, approval, activation,
  audit, rollback, and focused runtime-governance tests

Finish by regenerating affected artifacts when needed and validating source,
generated, access-policy, import/export, and documentation context.
```
