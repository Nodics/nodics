# Stock Core

Stock Core records the exact on-hand quantity of an item at an enterprise-owned
Warehouse and optional Warehouse Location. It also preserves the movement
evidence that explains every accepted or rejected change.

## Business Model

A Stock Balance is identified by enterprise, Warehouse, optional Location,
item type, item code, and optional batch, condition, and owner. Those fields
allow one SKU, land parcel, liquid, weighed item, serialized category, or other
business item to be separated without creating a second stock authority.

The balance stores an exact decimal string, Unit, dimension vector, scale, and
revision. A Stock Movement stores the idempotency key, movement type, original
quantity, normalized delta, expected revision, result, actor, reason, source,
and failure evidence.

## Applying A Movement

1. Resolve the authenticated enterprise.
2. Validate the Warehouse, optional Location, and Unit through their owning services.
3. Ask Units to normalize the original quantity and Unit exactly into the balance Unit. Consolidated and modular deployments use the same Units intent contract.
4. Create or recover the idempotency-keyed `PENDING` movement.
5. compare-and-set the balance at the caller's expected revision.
6. Mark the movement `APPLIED`, or `REJECTED` for a safe business failure.

Replaying the same idempotency key with the same intent returns the recorded
result and does not apply the quantity twice. Reusing that key for a different
stock, original quantity/Unit, normalized delta, movement type, reason, balance
Unit, or expected revision fails.

If the process stops after the balance update but before terminal movement
state is persisted, replay detects `lastMovementCode` plus the resulting
revision and completes the original movement without changing the balance
again.

## Configuration

Configure `inventory.stock` in `properties.js`:

- `movementTypes` is the allow-list of business movement classifications.
- `allowNegative` controls whether a movement may take on-hand below zero.
- `defaultScale` defines stored decimal precision when the caller omits it.
- `roundingMode` controls exact normalization; `UNNECESSARY` fails rather than silently rounding.
- `maximumRetries` is reserved for a later bounded provider retry contract and is not used by Stock Core yet.

Configure `inventory.unitsReference` in `properties.js`:

- `moduleName`, `apiVersion`, and `apiName` locate Units through existing `servers` configuration;
- `requestTimeoutMs` and `maximumAttempts` bound remote work;
- `preferLocal` uses the same Units intent service directly when co-hosted.

Tokens and endpoints do not belong in Inventory configuration. Nodics supplies
the tenant-bound internal token and resolves module transport.

Layer project values through normal Nodics configuration. Do not put runtime
Stock policy in `package.json`.

## Developer Contract

Use `DefaultStockMovementService.apply(request)`. Generated services for
`stockBalance` and `stockMovementRecord` are persistence details and are guarded
by interceptors. Direct save, update, or delete is rejected unless the owning
repository supplies the internal mutation marker. Reads remain enterprise scoped.

Keep quantities as decimal strings. `movement.unitCode` is the original Unit;
when omitted it defaults to the balance `stock.unitCode`. JavaScript
floating-point arithmetic is not an accepted Stock path. Units remains
the authority for Units, dimensions, arithmetic, factors, geography, and
rounding in both local and remote deployments.

## Implemented Boundary

Stock Core supports co-hosted or separately deployed Units and exact
same-Unit, direct-factor, or inverse-factor conversion into the balance Unit.
It does not yet implement multi-hop conversion graphs, reservations,
allocations, available-to-sell, sourcing, coordinated Warehouse transfers,
public or BackOffice routes, or external provider synchronization.

## Failure And Recovery

- invalid Warehouse, Location, Unit, movement type, or reason: reject before balance mutation;
- unavailable, incompatible, ambiguous, inexact, timed-out, or malformed Units conversion: reject before movement/balance persistence;
- idempotency-key reuse with another intent: reject with `ERR_INV_00012`;
- stale expected revision: record `REJECTED` and return `ERR_INV_00013`;
- disallowed negative result: record `REJECTED` and return `ERR_INV_00014`;
- ambiguous terminal-state persistence: reload evidence and fail with `ERR_INV_00015` if it cannot be reconciled.

Keep a `PENDING` movement when an infrastructure failure leaves the outcome
uncertain. Replay is the recovery mechanism; do not guess or apply a second
movement.

## Verification

```bash
node gComm/inventory/test/stockMovementCore.test.js
node gComm/inventory/test/inventoryUnitsReferenceProvider.test.js
```

The tests cover exact receipt and issue arithmetic, gram-to-kilogram conversion,
local/remote provider parity, service-token headers, malformed/timeout failure,
replay idempotency, optimistic revision conflict, negative-stock rejection,
and direct-mutation protection.
