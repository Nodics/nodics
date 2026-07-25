# database Documentation

This folder contains permanent human-readable documentation for the `gFramework/nDatabase/database` module boundary.

Keep architecture, runtime contracts, configuration behavior, operational notes, troubleshooting, and extension decisions here when they are too detailed for the module `README.md`.

Update this folder whenever module behavior, public contracts, security posture, lifecycle, or customization rules change.

## Transaction operating guide

Use a transaction only when several records must become visible together.
Call `DefaultDatabaseTransactionService.execute` with the owning `moduleName`
and authenticated `tenant`, then pass its opaque `transactionContext` on every
generated service request in the callback. Throwing aborts the whole unit.

Never retain, serialize, or reuse the context in another database. External
calls, events, and cache invalidation must occur after successful commit unless
their owning pipeline explicitly supports transactional deferral. Operators
must qualify the selected provider and deployment topology; adapter source
alone does not prove that a particular server is transaction-capable.
