# gComm AI Contracts

This folder contains module-specific AI/developer contracts for `gComm`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.
# Commerce Contracts

Implemented contracts:

- [Commerce Checkout Foundation](commerce-checkout-foundation-contract.md)

Read the checkout foundation before changing cart, order, inventory promise,
payment, fulfillment, shipment, return, refund, or promotion behavior.
Checkout is allocation-first and must remain configuration-driven and
module-owned.
