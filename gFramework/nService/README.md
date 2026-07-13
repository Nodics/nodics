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

## Service Model

Services are generated and handwritten business-behavior contracts that can be
generalized or overridden by later modules. Services own behavior, facades
orchestrate services, controllers map requests, and routers declare HTTP/access
contracts.

## Extension Contract

Project modules may add or replace services through the module hierarchy. New
service behavior must document configuration, tenant/request context, generated
artifacts affected, downstream dependencies, errors, diagnostics, and tests for
both default behavior and later-module overrides.
