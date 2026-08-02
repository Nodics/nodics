# cart AI Contracts

This folder contains module-specific AI/developer contracts for `gComm/cart`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Start with the group-level
[Commerce Checkout Foundation](../../../llm/contracts/commerce-checkout-foundation-contract.md)
before applying Cart-specific checkout rules.

## Checkout allocation contract

Cart checkout is allocation-first. Do not collapse split delivery or split
payment into direct fields on `cart` or `cartEntry`.

- `cartEntry` records the requested product quantity.
- `cartDeliveryGroup` and `cartDeliveryAllocation` split entry quantities by
  delivery destination or context.
- `cartPaymentGroup` and `cartPaymentAllocation` split entry quantities and
  amounts by payment mode or payment authority.
- Quantity and money fields are exact decimal strings.
- Optional `serialNumbers`, `inventoryReservationCode`, and
  `inventoryAllocationCode` are evidence fields for later Inventory authority;
  Cart does not own stock calculations.

Project modules customize validation through `cart.checkoutAllocation.policy`
or a replacement allocation policy service. Do not fork the OOTB schema or
introduce parallel cart allocation models for customer-specific checkout flows.
