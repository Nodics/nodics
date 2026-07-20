# flowSchema

`flowSchema` is the source of truth for application workflow definitions and
durable runtime records. It defines workflows, actions, channels, action
responses, carriers, items, carrier state, archives, and error carriers used by
`flowCore` and `flowApi`.

**Maturity: Production-ready capability.** Generated schema/API/CRUD contracts
cover the reusable models, but project definitions require domain validation,
retention, migration, access-policy, and lifecycle tests.

## Contract Rules

- Give every definition a stable code and governed version/migration path.
- Validate one head, reachable actions, valid channel targets, allowed
  decisions, terminal paths, handler references, and cycle policy.
- Keep tenant, carrier, item, source reference, state, action history, error,
  correlation, and definition-version data sufficient for recovery and audit.
- Treat callback and item detail as classified business data. Define size,
  encryption, redaction, retention, archive, deletion, and legal-hold policy.
- Use schema access policy and service commands for state changes; generated
  CRUD existence does not authorize arbitrary workflow mutation.

Schema changes flow through later active modules and normal Nodics generation.
Do not hand-edit generated artifacts or create a second workflow-definition
store in BackOffice, tooling, or a project client.

## Verification

Run the workflow suite and generated contracts. Add tests for missing or
duplicate heads, broken targets, forbidden decisions, invalid states, cycles,
tenant isolation, ownership, optimistic/concurrent updates, old definition
versions, archive/error records, payload boundaries, migration, and recovery.

## Continue

- Workflow family: [workflow](../README.md)
- Runtime engine: [flowCore](../flowCore/README.md)
- HTTP commands: [flowApi](../flowApi/README.md)
- Database contracts: [nDatabase](../../../gFramework/nDatabase/README.md)
