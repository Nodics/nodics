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

`DefaultBackofficeRegistryStoreService` is the single asynchronous lease-store
boundary. Memory mode supports local and single-instance deployments.
Distributed mode obtains the configured engine client from nCache, applies the
lease TTL at provider write time, and enumerates leases using bounded incremental
SCAN. It never creates a Redis client, loader, signal handler, or lifecycle path.
A production multi-replica deployment enables the nCache distributed engine and
sets `backofficeRegistry.store.mode` to `distributed`. Replica behavior is
tested against one shared store contract.

Distributed expiry uses an atomic expiry-coordinate comparison at this store
boundary. A stale sweep cannot delete a lease renewed by another replica, and a
provider without atomic conditional deletion fails closed. After each sweep,
process-local availability and discovery state is reconciled against active
leases without deleting durable active or pending contract history.

Registration and deregistration require a service token whose declared runtime
instance matches the request and whose module claims contain every module in a
registration batch. Human username/password sessions never register modules.
Production deployments may replace service-token issuance with workload
identity, but must preserve these claims and route permissions.

Profile validates bounded, unique, syntactically valid module declarations. It
does not compare a caller's module composition with Profile's own active-module
list because server composition is local runtime state, not Profile authority.
The authenticated workload credential is responsible for who may request those
claims; production should use per-runtime credentials or infrastructure
workload identity rather than one shared bootstrap credential.

Discovery returns only configured client-safe fields. Tokens, credentials,
secret references, internal headers, request bodies, private topology settings,
and registration expiry internals are never returned to the frontend.
Discovery filters modules using the authenticated caller's permissions. The
bootstrap route returns that same authorized catalogue plus contract-version
metadata and a freshness-bounded observation of target-owned public readiness;
it is not authoritative health, topology, activation, or business configuration.

The modular topology contract starts every configured runtime composition,
waits for all active modules and readiness observations to appear, restarts the
CMS runtime, and proves the old process lease disappears while the new process
identity registers. It then restarts BackOffice and proves leases, readiness
observations, discovery cache, and the durable contract pointer recover. The
probe uses child-process IPC only and does not add a production diagnostics
route.
