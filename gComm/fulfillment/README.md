# Fulfillment

`fulfillment` is the Commerce fulfillment family group. It keeps the root clean
and groups shipment, delivery, carrier, and future fulfillment operations
modules under one business capability area.

Implemented child modules:

- [Fulfillment Core](fulfillmentCore/README.md) owns the current consignment,
  shipment, carrier-provider, warehouse-task, tracking-event, return-pickup, and
  delivery-release foundation.

Planned child modules, if later split from the core capability:

- `shipping` for business shipping-mode configuration if it grows beyond core
  fulfillment policy;
- `delivery` for delivery execution abstractions when operational delivery
  becomes independent from shipment evidence;
- `carrier` for carrier/provider adapters if provider orchestration becomes a
  standalone capability.

Do not place runtime schemas, routers, services, or business workflows directly
in this group.
