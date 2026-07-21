# Stock Pool Foundation

## Purpose

A Stock Pool is a reusable, enterprise-owned grouping of Warehouses. It lets a
later sourcing policy refer to one logical group such as UAE Fulfillment,
Northern Pickup, or Returns Warehouses instead of repeating Warehouse lists.

A Pool never owns or copies Stock quantities. `stockBalance` remains the
quantity authority at its Warehouse and optional Location. A Pool also does not
contain product, country, zone, channel, customer-segment, or delivery rules;
those conditions belong to the later Sourcing capability.

## Data Contracts

`stockPool` contains:

- authenticated `enterpriseCode`;
- stable business `poolCode` and derived internal `code`;
- business name and optional description;
- configured type and lifecycle status;
- optional effective-from and effective-to dates.

`stockPoolMember` contains:

- authenticated enterprise and Pool code;
- one authoritative Inventory Warehouse code;
- integer priority, where a lower number is considered earlier by Stock Sourcing;
- lifecycle status and optional effective dates.

A Warehouse may belong to several Pools. It may appear only once in the same
Pool. Membership priority does not reserve, move, aggregate, or promise Stock.

## Business Workflow

1. Create a Pool in `DRAFT` with a stable Pool code, name, and type.
2. Add one or more Warehouse memberships in `DRAFT` and set their priorities.
3. Confirm every Warehouse belongs to the authenticated enterprise and has not been retired.
4. Activate the Pool and Warehouse before activating the membership.
5. Suspend a Pool or membership for a reversible operational pause.
6. To retire a Pool, retire all memberships first and then retire the Pool.

Do not delete Pool records. Retirement keeps historical sourcing and operational
evidence interpretable.

## Configuration And Customization

Layer `inventory.stockPool` and `inventory.stockPoolMember` in `properties.js`.
Pool types, statuses, transitions, and priority bounds are configurable. A
project can add a type such as `COLD_CHAIN` in a later module without changing
Inventory source.

Prefer the smallest later-layer property or service override. Preserve
enterprise isolation, derived identities, authoritative Warehouse validation,
ordered membership, lifecycle history, and no-hard-delete behavior. Do not add
a second Pool registry or copy Warehouse/Stock data into Pool documents.

## Security And Operations

Generated Pool services and CRUD routers are private in this slice. Human or
BackOffice administration requires a later intent API with explicit human
permissions and negative security tests. Module service tokens must remain
separate from human login.

Operators should monitor rejected enterprise scope, missing/retired
dependencies, invalid transitions, duplicate membership, and retirement
dependency errors. Back up Pools and memberships with Warehouse and Stock
collections. Restore Warehouses before memberships.

## Current Boundary

Implemented: Pool and Warehouse membership schemas, enterprise scope,
classification, priority, effective dates, lifecycle, dependency validation,
retirement ordering, private persistence, and customization configuration.

Implemented separately: declarative sourcing Policies and Rules. Not implemented: sourcing intent APIs/caching, availability aggregation,
product/channel/zone/segment eligibility, reservations, allocations, public or
BackOffice APIs, events, cache/search projections, or external integrations.

## Verification

```bash
node gComm/inventory/test/stockPoolFoundation.test.js
```

The test covers positive creation, derived identity, membership dependency,
activation safety, immutable identity, priority boundary, retirement ordering,
enterprise mismatch, no-hard-delete behavior, private schemas, interceptors,
and later-layer Pool type customization.
