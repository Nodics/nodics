# How Stock Allocation Works

Allocation connects customer demand to reserved supply. An Order line can use one Warehouse, split across several Warehouses, or allocate what is available and backorder the remainder.

Order owns the customer order. Inventory receives only stable Order and line references, item identity, exact requested quantity, and active Reservation references. It records which Warehouses will supply the line and later connects each assignment to its applied Stock ISSUE movement.

Cancellation releases unfulfilled Reservation holds. Fulfillment cannot be claimed by a caller; Inventory verifies movement evidence. This keeps checkout, Inventory, and fulfillment consistent while allowing each module to remain independently deployable.

Configure partial allocation and assignment limits in Inventory `properties.js`. Internal allocation routes require service tokens and are intended for Order or fulfillment modules, not direct human access.

## Continue

- [How to Reserve Stock](how-to-reserve-stock.md)
- [How Stock Movements Work](how-stock-movements-work.md)
- [How Stock Availability Works](how-stock-availability-works.md)
- [Nodics Documentation](../README.md)
