# How Stock Sourcing Works

Stock Sourcing answers **which Stock Pools should this request check, and in what order?** It does not answer how much Stock is available.

## Business Example

For UAE web and mobile sales, create a Policy named `UAE_COMMERCE`. Add an INCLUDE Rule for country `AE` and channels `WEB` or `APP`, referencing the UAE fulfilment Pool. Add an EXCLUDE Rule for delivery requests if a pickup-only Pool must not participate.

Activate the referenced Pools, Policy, and Rules. An authorized Nodics module calls the internal sourcing endpoint and receives an ordered Pool list. A later Availability capability will inspect the Warehouses and calculate quantities.

## Operating Safely

- Lower priority numbers run earlier.
- `FIRST_MATCH` stops after the first matching Rule in that Policy.
- `COLLECT_MATCHES` lets multiple Rules contribute Pools.
- Suspend a Rule or Policy for temporary rollback.
- Retire Rules before their Policy.
- Never treat a returned Pool as a promise that Stock exists.

If activation fails, verify the Policy and Pools are active. For an empty result, inspect effective dates, status, criteria spelling, configured context keys, and priority. Do not edit Stock balances or duplicate Warehouses to fix sourcing configuration.

The endpoint is for trusted module-to-module communication. Business users do not call it directly, and a human login token is intentionally rejected. A future BackOffice screen must use separately permissioned administration APIs rather than generated Policy or Rule CRUD.

For performance, Nodics caches the ordered Pool result using the configured `nCache` provider. Local cache suits one process or development; Redis and Hazelcast support shared distributed deployments. Hazelcast is implemented but remains disabled by default and must pass the guarded live-cluster test before production selection. Cache outages do not stop sourcing requests: Nodics evaluates directly. Policy, Rule, Pool, and membership changes invalidate affected tenant results automatically.

Read the [Stock Sourcing foundation contract](../../gComm/inventory/docs/stock-sourcing-foundation.md) for schemas, configuration, security, customization, recovery, and tests.

## Continue

- [How To Manage Stock Pools](how-to-manage-stock-pools.md)
- [How Stock Movements Work](how-stock-movements-work.md)
