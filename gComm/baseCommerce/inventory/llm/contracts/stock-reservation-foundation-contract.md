# Stock reservation foundation contract

- `stockBalance.quantity` and `stockBalance.reservedQuantity` are operational authorities.
- Reservation and movement mutations share Stock Balance optimistic revision control.
- Cache is never quantity authority.
- Reservation evidence is enterprise-scoped, idempotent, lifecycle-governed, and not hard-deleted.
- `ACTIVE` holds reduce AVAILABLE_TO_SELL; `CONSUMED` holds remain until their matching ISSUE commits.
- Expiry is exposed for the existing CronJob module; Inventory does not own a second scheduler.
- Internal commands require service identity and preserve the human-login boundary.
