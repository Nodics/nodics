# Change Gate Contract

This contract makes Nodics development strict without applying the most
expensive review to every edit. It applies to human and AI-assisted development.

## Verification Scope Contract

Gate scope follows code ownership, not repository availability.

- In **framework-maintainer mode**, apply proportional gates to the affected
  Nodics framework modules and broaden to platform verification only when the
  change category requires it.
- In **application-developer mode**, treat the released Nodics framework as an
  immutable, previously qualified dependency. Apply all applicable acceptance
  rules to project-owned modules, overrides, configuration, generated output,
  and effective project behavior, but do not inspect, modify, regenerate, or
  requalify Nodics framework source by default.
- Framework inspection or modification during application development requires
  an explicit developer request. A project customization test may exercise the
  public/effective framework behavior without opening a framework-wide audit.
- Never expand verification to the entire Nodics repository solely because its
  source is locally available. Select the smallest scope that proves the owned
  change safely.

This boundary is mandatory for token and execution efficiency. It cannot be
used to skip project-level security, tenant, compatibility, layering, or
customization checks.

## Gate 1: Change Slice

Run the five questions in `daily-change-checklist.md` once per coherent change
slice, not once per file or keystroke.

Required evidence:

- owner and existing mechanism
- later-layer customization path
- affected-layer classification
- focused test selection

Fail the gate when ownership or customization is unclear, an existing mechanism
has not been inspected, or the proposal adds an unnecessary parallel path.

Keep the result concise. A few lines are normally sufficient.

## Gate 2: Commit

Run once against the complete staged or intended commit diff before committing.
This gate does not authorize a commit; version-control actions still require the
developer's approval.

Required review:

1. Confirm the diff is one coherent change and contains no unrelated edits.
2. Apply the Change Acceptance Contract in `nodics-principles.md`.
3. Apply the change-impact matrix in `artifact-definition-and-change-guide.md`.
4. Check for project/customer hardcoding, duplicate loaders, copied services,
   secrets, debug artifacts, and manually maintained generated output.
5. Confirm human readability, ownership, contracts, failure behavior, extension
   points, and configuration meaning.
6. Resolve security, access control, tenant context, validation, audit,
   diagnostics, backward compatibility, migration, and rollback impacts where
   applicable.
7. Run the focused tests and the proportional verification required by
   `testing-playbook.md`.
8. Regenerate and validate source-derived artifacts when affected.
9. Update module, API, configuration, migration, and LLM documentation when affected.

Required completion report:

- change and reason
- ownership and customization path
- affected and unaffected layers
- tests and validation executed
- tests not executed and why
- generated, migration, rollback, and residual-risk impact

Fail the gate when a required customization test is absent, generated artifacts
are stale, applicable security/tenant/compatibility impacts are unresolved,
required verification fails, or the change is not maintainable by another
developer.

## Gate 3: Merge Or Release

Run before merging to the stable branch or preparing a release.

Required review:

- inspect the complete branch diff, not only the final commit
- run build and broader platform verification appropriate to the branch risk
- run consolidated and modular topology tests for cross-module behavior
- verify clean/build recreation for generated artifacts
- verify migrations, backfills, rollback, compatibility, and deployment order
- confirm no temporary reports, credentials, debug code, or local assumptions remain
- confirm module and LLM context validation

Fail the gate on an unexplained skipped required test, stale generated output,
unresolved migration/rollback risk, topology regression, or undocumented breaking
change.

## Gate 4: Periodic Platform Audit

Run at a milestone, after a major module refactor, before a significant release,
or on an agreed periodic schedule. Do not run this gate for every commit.

Audit:

- module structure and naming standards
- duplicate or parallel runtime mechanisms
- layered customization and override traceability
- documentation and generated LLM-context quality
- security, access-control, and tenant boundaries
- runtime activation, audit, rollback, and diagnostics
- clean/build reproducibility
- full tests and consolidated/modular topology
- deprecated and compatibility paths
- temporary/generated artifact placement

Persist reports only under the active server/node generated-report location when
a durable report is required. Do not use repository `temp` or the refactor-only
`docs` folder as a runtime report destination.

## Proportional Verification

| Change category | Minimum gate evidence |
| --- | --- |
| Documentation only | documentation validation and diff check |
| Properties/configuration | focused validation, configuration test, layered override test |
| Handwritten service | focused positive, negative, and later-layer override tests; shared basic tests when applicable |
| Schema/router/generator | clean, build, generated tests, LLM/generated validation, basic suite |
| Security/tenant/runtime governance | adversarial focused tests, governance tests, basic suite |
| Cross-module/topology | focused tests, consolidated topology, modular topology, full suite |
| Tooling/build lifecycle | tooling tests, clean/build reproduction, generated validation, basic suite |

The reviewer may require broader verification when risk crosses categories. A
developer or LLM may not silently select a weaker category to avoid a required
test.

## Token And Execution Efficiency

- Scope reads, generation, and verification to project-owned code when operating
  in application-developer mode; released framework quality is not re-audited
  without explicit developer direction.
- Load `daily-change-checklist.md` for normal work; load this full contract only at a gate.
- Read only the relevant artifact guide, module context, and source files.
- Refer to canonical rules instead of reproducing them in every response.
- Reuse analysis and passing test evidence while affected files remain unchanged.
- Run focused checks first; run broader suites once at the appropriate gate.
- Report outcomes and exceptions, not verbose transcripts of successful commands.
- Never trade correctness for token reduction. Escalate context and verification
  when ownership, security, tenant isolation, compatibility, or runtime behavior is uncertain.
