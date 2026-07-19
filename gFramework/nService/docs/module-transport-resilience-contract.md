# Module Transport Resilience Contract

`DefaultModuleService` is the authoritative HTTP boundary for Nodics
module-to-module and governed external calls. Callers continue to use
`buildRequest`, `buildExternalRequest`, and `fetch`; projects customize policy
through layered `serviceCommunication` properties or a later-loaded same-name
service override.

Every request has a bounded deadline and uses shared keep-alive agents. Safe
reads may retry transient network failures and configured HTTP statuses with
bounded exponential backoff and jitter. Writes retry only when the caller
provides an idempotency key. A per-module or per-origin circuit opens after the
configured failure threshold and permits a half-open recovery probe after its
cooldown.

TLS certificate verification is mandatory. Projects requiring private trust
roots must configure the process trust store or override the transport with a
verified enterprise CA policy; disabling certificate verification is not a
supported resilience option.

Diagnostics expose counts, latency, timeout/retry totals, and circuit state.
They never include authorization headers, API keys, request bodies, response
bodies, query secrets, or credential material. Runtime shutdown destroys the
connection pools through the central lifecycle service.

Provider-specific clients must delegate module HTTP calls to this service rather
than adding independent retry, pooling, circuit, or timeout authority paths.
