# Warehouse Foundation

## Business Purpose

A warehouse is the enterprise-owned logical authority that will later hold and
fulfill stock. A warehouse location is an optional position inside it, such as
receiving, storage, aisle, rack, bin, sales floor, back room, pickup, returns,
quarantine, or damaged stock.

This foundation does not yet expose a business API or BackOffice page.
Intent-specific administration APIs and permissions follow in a later slice.

## Business Lifecycle

Create a warehouse in `DRAFT`, verify its identity and metadata, and move it to
`ACTIVE`. An active warehouse may be `SUSPENDED` temporarily or `RETIRED`
permanently. A suspended warehouse may return to active. A retired warehouse
cannot be reactivated.

```text
DRAFT → ACTIVE → SUSPENDED → ACTIVE
  └────→ RETIRED ←────┘
```

Locations use the same transitions. Retire child locations before their parent
and every location before its warehouse. Never hard-delete these records;
future stock, ledger, transfer, store, and audit references require history.

## Enterprise Isolation And Identity

Every operation resolves enterprise identity from authenticated claims. A body
or query attempting another enterprise fails. The tenant selects the database
boundary; `enterpriseCode` enforces the business-owner boundary inside it.

Business codes may repeat across enterprises because the primary code is
derived:

```text
enterpriseA::warehouse::dubaiCentral
enterpriseB::warehouse::dubaiCentral
enterpriseA::location::dubaiCentral::receiving
```

Users supply `warehouseCode` and `locationCode`; they do not construct or
override internal `code`.

## Location Hierarchy

A location either has no parent or names one non-retired parent in the same
enterprise and warehouse. The service derives `path` and `depth`, rejects self
parenting and cycles, and enforces `inventory.location.maxDepth`.

```text
storage                       depth 0, path [storage]
└── aisleA                    depth 1, path [storage, aisleA]
    └── rack01                depth 2, path [storage, aisleA, rack01]
        └── bin05            depth 3, path [storage, aisleA, rack01, bin05]
```

Parentage is immutable. Later stock movement uses governed transfers rather
than rewriting historical location identity.

## Administrator Configuration

Layer configuration instead of editing OOTB inventory:

```js
module.exports = {
    inventory: {
        warehouse: {
            types: ['PHYSICAL', 'VIRTUAL', 'STORE', 'MICRO_FULFILLMENT'],
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED']
        },
        location: {
            maxDepth: 6,
            types: ['RECEIVING', 'ZONE', 'AISLE', 'RACK', 'BIN']
        }
    }
};
```

Verify effective array merging for the project. Removing a classification used
by persisted records requires a governed migration. Changing the identity
separator after data exists is also an identity migration.

## Developer Contract

Schemas live in `src/schemas/schemas.js`; generated services own persistence.
Interceptors execute before generated save/get/update/remove operations so
callers cannot bypass foundation governance accidentally.

- `DefaultInventoryEnterpriseScopeService` resolves claims, validates business
  codes, derives identities, and scopes queries.
- `DefaultInventoryWarehouseFoundationService` validates classifications,
  effective dates, identity, transitions, retirement, and deletion.
- `DefaultInventoryWarehouseLocationFoundationService` validates the warehouse,
  parent, path, depth, identity, transitions, children, and deletion.

Do not call a database provider directly. Do not create another warehouse
loader, hierarchy engine, lifecycle, or tenant/enterprise resolver.

## OOTB Customization

Add classifications through a later module's properties and prove the effective
configuration in its test. For another enterprise claim contract, replace the
smallest scope method while retaining mismatch rejection and query scoping. For
extra location rules, layer an interceptor or replace the smallest validation
method rather than copying the module.

## Failures And Recovery

| Error | Meaning | Recovery |
| --- | --- | --- |
| `ERR_INV_00001` | No authenticated enterprise claim | Authenticate through Profile with the correct enterprise |
| `ERR_INV_00002` | Body/query enterprise mismatch | Remove caller-owned scope or use the correct enterprise |
| `ERR_INV_00003` | Invalid warehouse identity, classification, or dates | Correct the code/policy/data |
| `ERR_INV_00004` | Invalid lifecycle transition | Follow the configured transition sequence |
| `ERR_INV_00005` | Invalid location hierarchy or retirement order | Correct parent/warehouse/depth or retire children first |
| `ERR_INV_00006` | Stable identity or parentage change | Create a new record and govern migration |
| `ERR_INV_00007` | Hard delete attempted | Retire the record |
| `ERR_INV_00008` | Warehouse has non-retired locations | Retire locations from leaves to root |
| `ERR_INV_00009` | Warehouse reference is unavailable | Verify tenant, enterprise, code, lifecycle, and Inventory availability |
| `ERR_INV_00010` | Non-service identity used internal lookup | Use the existing tenant-scoped module service token |

A failed validation does not reach persistence. Stock atomicity, idempotency,
and recovery are not claimed until the stock slice is implemented.

## Internal Warehouse Reference Lookup

`POST /nodics/inventory/v0/references/warehouses/resolve` is an Inventory-owned
module-to-module intent route. It requires the existing internal service-token
permission, authenticated tenant, and enterprise context; human access tokens
are rejected. The request accepts only `warehouseCode`.

The safe response contains enterprise code, warehouse code, status, type,
country, and capabilities. It never returns internal primary identity, address,
external references, operational details, or credentials. Missing, retired,
duplicate, malformed, and cross-enterprise targets fail closed.

## Security And Operations

- Generated CRUD routers are disabled; only the service-token Warehouse
  reference intent route is enabled.
- Human and service authentication remain separate Profile/nAuth concerns.
- Enterprise identity comes from authenticated claims, not request bodies.
- External references contain identifiers only, never credentials.
- Monitor repeated scope mismatch, hierarchy, transition, and retirement errors.
- Restore a warehouse with its location hierarchy; never restore orphaned
  locations.

## Verification

```bash
node gComm/inventory/test/inventoryWarehouseSchemaContract.test.js
node gComm/inventory/test/inventoryWarehouseFoundationService.test.js
node gComm/inventory/test/inventoryWarehouseReferenceContract.test.js
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

Focused tests cover schema/index boundaries, private routing, interceptor
wiring, identity, lifecycle, hierarchy, missing enterprise, cross-enterprise
rejection, invalid codes/transitions, immutable identity, missing/self parents,
depth, retirement order, hard-delete rejection, and configuration extension.
