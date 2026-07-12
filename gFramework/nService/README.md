# nService

`nService` owns shared service-layer contracts used by framework and project
modules, including module communication, tenant/enterprise handling,
authentication-provider cache access, authorization helpers, and status/log
services.

Authentication token cache helpers must preserve tenant scope and avoid leaking
credential material. Invalidation callbacks may emit structured observability
and audit context such as reason code, tenant, enterprise, principal, source,
and token type, but must never log or persist bearer tokens, refresh tokens,
API keys, or auth cache keys.
