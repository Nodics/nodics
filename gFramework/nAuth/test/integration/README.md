# nAuth P2 Integration Contract

These tests validate the boundaries that unit contracts cannot prove alone:
shared-cache atomicity, tenant isolation, distributed security stamps, service
identity revocation, persisted migration behavior, and modular token use.

The default deterministic suite uses isolated in-memory or temporary-file
adapters and never connects to production infrastructure. Its tenant and
database names must contain `test`.

Live shared-cache verification is explicit and never silently skipped:

```bash
NODICS_AUTH_P2_REDIS_URL=redis://127.0.0.1:6379 npm run test:auth-p2:redis
```

The release form fails when the live dependency is absent:

```bash
NODICS_AUTH_P2_REDIS_URL=redis://127.0.0.1:6379 npm run test:auth-p2:release
```

`hazelcast` is not a supported distributed auth engine yet. The current module
is an explicitly non-distributed compatibility placeholder and strict auth
startup rejects it. A future project or framework adapter may enable it only
after providing a real distributed client and atomic take/consume semantics.

Project and environment modules may supply different safe test tenant,
database, cache, and topology values through environment configuration without
editing these framework tests.
