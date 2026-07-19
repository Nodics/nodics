# BackOffice Module Registry Contract

BackOffice owns observed module-instance leases. Nodics configuration owns
declared endpoints and active modules; target modules own business contracts and
authorization. The registry must never become a second configuration loader,
service router, or data-plane proxy.

Every active module in a runtime instance is reported asynchronously after
startup in one bounded registration batch using a runtime-bound internal
service token. Router-enabled client-callable modules include their approved
endpoint; service-only, configuration, and supporting modules register without
inventing an HTTP endpoint. Registrations are idempotent by module and runtime
instance identity, renewed before lease expiry, and removed during graceful
drain when possible. BackOffice unavailability never blocks traffic startup.
Stale leases expire when processes crash or cannot deregister.

`DefaultBackofficeRegistryStoreService` is the single replaceable lease-store
boundary. Its default process-memory implementation supports local development
and reconciles after BackOffice restart through runtime heartbeats. A
multi-replica production deployment must replace that store service with a
shared TTL-capable implementation; it must not replace the registry service or
add a second registration path. Replica behavior is tested against one shared
store contract.

Registration and deregistration require a service token whose declared runtime
instance matches the request and whose module claims contain every module in a
registration batch. Human username/password sessions never register modules.
Production deployments may replace service-token issuance with workload
identity, but must preserve these claims and route permissions.

Discovery returns only configured client-safe fields. Tokens, credentials,
secret references, internal headers, request bodies, private topology settings,
and registration expiry internals are never returned to the frontend.
Discovery filters modules using the authenticated caller's permissions. The
bootstrap route returns that same authorized catalogue plus contract-version
metadata and an observed availability summary; it is not authoritative health,
topology, activation, or business configuration.
