# mongodb AI Contracts

This folder contains module-specific AI/developer contracts for `gFramework/nDatabase/mongodb`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Transaction rules

- Keep native sessions behind nDatabase transaction authority.
- Propagate `{ session }` to every participating MongoDB operation.
- End sessions in `finally`.
- Use snapshot reads, majority writes, and configured commit timeout.
- Require replica-set or sharded topology qualification.
