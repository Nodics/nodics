# database AI Contracts

This folder contains module-specific AI/developer contracts for `gFramework/nDatabase/database`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Transaction contract

- Use `DefaultDatabaseTransactionService`, never a driver session in business code.
- Pass the opaque context unchanged through generated service requests.
- Keep all records in the same resolved module/tenant database.
- Fail closed when `multiRecordAtomic` is absent.
- Prove commit, abort, expired context, wrong database, concurrency conflict,
  and live-provider topology before activation.
