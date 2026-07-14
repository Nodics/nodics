# Nodics Testing Prompt

Use this prompt when adding, fixing, or planning Nodics tests.

```text
Design Nodics tests for this change as both a modular framework and a
distributed runtime.

Load the base Nodics assistant prompt, affected module context,
testing-playbook.md, and testing-and-release-contract.md. Load generated module
test context when available.

Classify the test need:
- focused unit or contract test
- schema/router/generated artifact test
- module-level capability test
- tenant/environment/server/node override test
- integration adapter contract test
- optional live-provider release gate
- topology or distributed communication test
- regression test for a reported bug

Tests must prove:
- the owning module provides the capability
- later-loaded project modules can override behavior when applicable
- default tenant and active tenant behavior are correct
- validation, authorization, audit, diagnostics, rollback, and traceability are
  preserved where relevant
- generated artifacts match source definitions after build/generation
- external integrations have deterministic contract tests and separate live
  gates when needed

Keep tests deterministic by default. Use live dependencies only behind explicit
release-gate commands. Do not satisfy coverage by testing generated output when
the source definition or generator contract is the real authority.
```
