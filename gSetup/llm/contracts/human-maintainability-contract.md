# Human Maintainability Contract

Nodics code must be understandable, diagnosable, safely changeable, and
reviewable by developers who did not create it. This applies equally to
human-written code and AI-generated code.

Maintainability is a platform contract because Nodics is an enterprise
application platform and application factory. A feature that works but cannot be
understood, diagnosed, overridden, or tested safely is incomplete.

## Required Qualities

Every meaningful source change should make these things clear:

- ownership: the module, layer, and capability that own the behavior;
- intent: why the behavior exists and which contract it supports;
- extension path: how a later project, environment, server, node, tenant, or
  customer layer can customize it without editing framework source;
- configuration meaning: which properties or metadata affect behavior and what
  their defaults mean;
- tenant/request behavior: whether the behavior is tenant-neutral or
  tenant-specific;
- failure behavior: validation errors, diagnostics, rollback/recovery, and
  sanitized observability;
- test proof: focused default behavior tests and override/customization tests
  where an extension point is added or changed.

## Simplicity Rule

Do not add a new abstraction merely because code could be abstracted. Add an
abstraction only when it removes real duplication, clarifies ownership, protects
an extension contract, or matches an established Nodics pattern.

Avoid parallel mechanisms. If a loader, registry, generator, resolver, service,
pipeline, or governance path already owns the behavior, extend that path instead
of creating a second authority.

## Reviewability Rule

A reviewer should be able to answer:

1. What source definition controls this behavior?
2. What runtime layer can override it?
3. What happens when validation fails?
4. What tenant/security/audit/diagnostic context is preserved?
5. Which tests prove the intended behavior and customization path?

If those answers require hidden assumptions, unexplained generated files, or
tribal knowledge, update code comments, README guidance, LLM contracts, tests,
or diagnostics before treating the work as complete.

## AI And Human Equality

AI-generated code has no special exemption from human maintainability. Human
developers also have no exemption from AI-facing contracts. Both must preserve
the same source-of-truth, layering, generated artifact, testing, and
documentation responsibilities.
