# BackOffice API and Catalogue Contract

## API Schemas

`src/schemas/apiContracts.js` is the source definition for registration batch,
module registration, module lease, discovery, bootstrap, compatibility, and
diagnostics JSON contracts. The registration route uses the same definition in
OpenAPI metadata. `DefaultBackofficeContractService` enforces bounded fields,
module-name syntax, unique arrays, batch identity consistency, catalogue field
allowlists, and the absence of undeclared fields.

Tokens, credentials, secrets, provider configuration, and arbitrary metadata
are not valid registration fields. Adding a contract field requires a source
schema change, validation change, tests, documentation, and generated-context
regeneration.

## Module-Owned Catalogue Metadata

A module may declare `nodics.backoffice` in its own `package.json`:

- `enabled` controls catalogue contribution, not module activation;
- `capabilityId`, `displayName`, `category`, and `icon` are client-safe labels;
- `contractVersion` and `minimumClientContractVersion` drive compatibility;
- `requiredPermissions` filters module discovery;
- `roles` declares how the module participates in BackOffice;
- `discovery` references existing module-owned contract endpoints;
- `uiComposition` may declare non-executable defaults only for a declared UI
  composition provider;
- `navigation` contributes identifiers, labels, logical routes, order, and
  optional permissions.

BackOffice observes this metadata during module registration. It does not keep
a manually duplicated catalogue. Target modules remain authoritative for their
routes, schemas, data, permissions, validation, and business behavior.
Normalized discovery snapshots and UI-composition selection follow
`capability-discovery-contract.md`.

## Compatibility Negotiation

Clients may send `x-nodics-client-contract-version` to the bootstrap route. The
value must be a positive integer. When omitted, BackOffice uses its configured
minimum client contract version.

- `COMPATIBLE`: client version meets or exceeds the module contract version.
- `DEGRADED`: client satisfies the module minimum but is older than the current
  module contract.
- `INCOMPATIBLE`: client is older than the module's minimum supported version.

Compatibility is advisory discovery state. It does not activate, deactivate,
proxy, or modify a module. The bootstrap response reports an overall state and
one state for each authorized catalogue module.

## Audit Events

BackOffice records sanitized registration, renewal, deregistration, rejection,
expiry, compatibility, and store-failure events. An environment or project
module may configure a publisher service. Audit fields are allowlisted; event
bodies never contain tokens, credentials, provider URLs, registration bodies,
or stored leases. Audit publication follows configured fail-open or fail-closed
policy.
