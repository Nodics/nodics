# nDynamo

`nDynamo` is the governed runtime change capability. It lets an authorized
operator propose selected configuration changes, inspect their impact, obtain
approval, activate them, audit the result, and roll them back without creating
a second static configuration loader.

The dynamo capability owns governed runtime definitions and activation services.
It supports schema, router, class, pipeline, access-policy, and tenant-property
control-plane behavior without requiring changes to static framework modules.

## When To Use Runtime Governance

Use `nDynamo` when supported schema, route, class, pipeline, access-policy, or
tenant-property behavior must change after deployment and the change needs
preview, approval, activation, audit, and rollback.

Use ordinary module source and layered `properties.js` for versioned defaults.
Use an external secret manager or approved external configuration for secrets.
Do not put every product setting into runtime governance merely because it can
change; select the authority based on lifecycle, ownership, risk, and audit
needs.

## Runtime governance lifecycle

The shared runtime lifecycle supports these configuration types:

- `schemaConfiguration`
- `routerConfiguration`
- `propertyConfiguration`
- `schemaAccessPolicy`

Preview identifies changed paths, affected artifacts, warnings, and destructive
risk without changing runtime state. Activation requests capture that preview,
the requester, reason, correlation identifier, and approval state. Property and
schema access-policy requests additionally store a canonical SHA-256 digest so
the approved patch cannot be substituted before activation.

Approval and activation enforce configured separation-of-duties rules. Successful
and failed activation attempts are audited. Rollback restores the previous
snapshot through the owning service instead of bypassing its runtime contract.
Property snapshots contain only changed values and absent paths, preventing
unrelated tenant configuration from being overwritten.

Schema access-policy changes use the same preview, approval, activation, audit,
and rollback lifecycle. Developers and AI tools must treat the generated
`schemaAccessPolicy` model as the persisted policy record and the runtime
governance services as the mutation contract for control-plane changes.

Generic CRUD routers for activation requests and activation logs are disabled.
Their model services remain internal dependencies of the dedicated,
permissioned control-plane endpoints.

## Security boundaries

Runtime property governance rejects secret-bearing paths and prototype-mutating
keys. Secrets remain owned by external layered configuration or a customer
secret-manager integration. All control-plane routes are secured and carry
action permissions defined by the profile runtime-configuration groups.
Dynamic class inspection, snapshot, update, and execute routes use
`dynamo.class.view`, `dynamo.class.snapshot.view`, `dynamo.class.update`, and
`dynamo.class.execute`. They also declare the `dynamicClass` `apiExposure`
category so local or support topologies can enable them deliberately while
production-like servers keep them unavailable by default. Sensitive paths are
matched by the layer-overridable `runtimePropertyGovernance.sensitivePathPatterns`
property.

## Customization contract

Later-loaded project modules may override preview, policy, activation-request,
audit, cleanup, or rollback services. Extensions must preserve configuration
type compatibility, tenant scoping, immutable approval intent, traceability, and
rollback semantics. Add a new configuration type to the existing lifecycle; do
not create a parallel activation channel.

## Dynamic Property Governance

Governed dynamic properties belong to `nDynamo` through the
`propertyConfiguration` lifecycle, not to ad hoc database or property mutation
paths.

Runtime property changes must use preview, approval, activation, audit, and
rollback services. Externally reachable code must not mutate tenant properties
directly.

## Tests

Run `npm run test:runtime-overrides` for focused governance coverage. The full
release gate is `npm run test:full`.

Also run generated schema/API contracts when a persisted configuration type or
route changes. Validate positive preview/activation, unauthorized access,
separation-of-duties rejection, patch substitution, sensitive/prototype path
rejection, stale revision, partial failure, audit correlation, cleanup, and
rollback boundaries.

## Integration And Authority Boundaries

`nConfig` remains authoritative for normal layered configuration and startup.
`nDynamo` governs only the supported runtime-mutable contract. `nRouter` owns
route exposure and authorization enforcement. `nSystem` exposes selected
control-plane APIs. The owning runtime service applies an approved change and
restores its previous snapshot; MCP, BackOffice, CLI, or AI tooling may call
those contracts but must not become another mutation authority.

## Observability, Performance, And Operations

- Correlate preview, request, decision, activation, audit, cleanup, and rollback
  without logging sensitive values.
- Make preview side-effect free and make activation fail closed on digest,
  revision, actor-separation, tenant, or policy mismatch.
- Keep activation off high-volume request paths; refresh effective registries
  through their existing events/services.
- Monitor pending age, rejected and failed decisions, activation duration,
  rollback outcome, cleanup backlog, and repeated conflicts.
- Back up governed persistence and verify restoration before high-risk changes.

## Common Mistakes

- Adding a direct property or database mutation endpoint.
- Storing secrets in runtime property configuration.
- Letting one actor request, approve, and activate a protected change.
- Recomputing or replacing the approved patch after approval.
- Creating a new lifecycle for one configuration type instead of extending the
  existing governance contract.
- Treating a BackOffice or MCP view as the source of configuration truth.

## Continue

- System control plane: [nSystem](../nSystem/README.md)
- Configuration guide: [How Configuration Works](../../gDocs/configuration/how-configuration-works.md)
- Operations: [Production Operating Model](../../gDocs/operations/production-operating-model.md)
- Framework map: [gFramework](../README.md)
