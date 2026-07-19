# BackOffice Module Registry Contract

BackOffice owns observed module-instance leases. Nodics configuration owns
declared endpoints and active modules; target modules own business contracts and
authorization. The registry must never become a second configuration loader,
service router, or data-plane proxy.

Every locally served router module registers asynchronously after runtime
startup using an internal service token. Registrations are idempotent by module
and instance identity, renewed before lease expiry, and removed during graceful
drain when possible. BackOffice unavailability never blocks traffic startup.
Stale leases expire when processes crash or cannot deregister.

The default process-memory implementation reconciles after BackOffice restart
through module heartbeats. Deployments needing shared state across BackOffice
replicas may override `DefaultBackofficeRegistryService` with a distributed
lease store while preserving the route, security, expiry, and safe-projection
contracts.

Discovery returns only configured client-safe fields. Tokens, credentials,
secret references, internal headers, request bodies, private topology settings,
and registration expiry internals are never returned to the frontend.
