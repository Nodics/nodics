# dynamo

The dynamo capability owns governed runtime definitions and activation services.
It supports schema, router, class, pipeline, access-policy, and tenant-property
control-plane behavior without requiring changes to static framework modules.

## Runtime governance lifecycle

The shared runtime lifecycle supports these configuration types:

- `schemaConfiguration`
- `routerConfiguration`
- `propertyConfiguration`

Preview identifies changed paths, affected artifacts, warnings, and destructive
risk without changing runtime state. Activation requests capture that preview,
the requester, reason, correlation identifier, and approval state. Property
requests additionally store a canonical SHA-256 digest so the approved patch
cannot be substituted before activation.

Approval and activation enforce configured separation-of-duties rules. Successful
and failed activation attempts are audited. Rollback restores the previous
snapshot through the owning service instead of bypassing its runtime contract.
Property snapshots contain only changed values and absent paths, preventing
unrelated tenant configuration from being overwritten.

Generic CRUD routers for activation requests and activation logs are disabled.
Their model services remain internal dependencies of the dedicated,
permissioned control-plane endpoints.

## Security boundaries

Runtime property governance rejects secret-bearing paths and prototype-mutating
keys. Secrets remain owned by external layered configuration or a customer
secret-manager integration. All control-plane routes are secured and carry
action permissions defined by the profile runtime-configuration groups.
Sensitive paths are matched by the layer-overridable
`runtimePropertyGovernance.sensitivePathPatterns` property.

## Customization contract

Later-loaded project modules may override preview, policy, activation-request,
audit, cleanup, or rollback services. Extensions must preserve configuration
type compatibility, tenant scoping, immutable approval intent, traceability, and
rollback semantics. Add a new configuration type to the existing lifecycle; do
not create a parallel activation channel.

## Tests

Run `npm run test:runtime-overrides` for focused governance coverage. The full
release gate is `npm run test:full`.
