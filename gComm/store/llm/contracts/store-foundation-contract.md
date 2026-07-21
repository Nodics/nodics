# Store Foundation Contract

- Resolve enterprise ownership from authenticated claims and fail closed when absent or conflicting.
- Derive primary identities from enterprise and business codes; never trust client-supplied internal identities.
- Store owns Store records and assignments. Inventory owns Warehouse records.
- Validate every assignment through the co-hosted Inventory service when available or the configured authenticated Inventory reference route when remote.
- Remote lookup uses the tenant-scoped internal token, enterprise header, bounded read request, and allow-listed Inventory projection.
- A Store may have no warehouse or many warehouses. An assignment identifies one Store/Warehouse pair and carries purposes and priority.
- Identity fields are immutable. Lifecycle transitions come from `store/config/properties.js`.
- Retire assignments before retiring their Store. Never hard-delete foundation records.
- Generated public routers remain disabled until secure intent APIs are separately implemented.
- Later modules may extend configuration or replace services but must preserve isolation, ownership, and historical-reference invariants.
