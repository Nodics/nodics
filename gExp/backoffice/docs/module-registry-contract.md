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
Environment, server, and optional node names are safe observed coordinates used
to distinguish runtime instances such as CMS Staged and CMS Online; they are
derived from registration and never become topology configuration authority.
Discovery filters modules using the authenticated caller's permissions. The
bootstrap route returns that same authorized catalogue plus contract-version
metadata and a freshness-bounded observation of target-owned public readiness;
it is not authoritative health, topology, activation, or business configuration.

The local topology contract first starts `monoServer`, proves every active
module self-registers with one process identity, validates the client-safe
projection, restarts the process, and proves registration and durable contract
selection recover. The modular phase starts every configured runtime, restarts
Profile, and proves its replacement identity appears without losing unrelated
leases. A human logs in over HTTP at Profile and uses the returned Bearer token
directly at BackOffice before restart, after Profile restart, and after
BackOffice restart; tenant, permission, and human-versus-service boundaries
remain enforced. It then restarts CMS Staged and proves it remains distinct
from uninterrupted CMS Online while both aggregate under one CMS capability.
Finally, BackOffice restart recovers leases, readiness observations, discovery,
and the durable contract pointer.

The modular contract selects Profile, NEMS, Cronjob, Data Consumer, Workflow,
CMS Staged, CMS Online, and BackOffice from the registry projection and calls
their advertised endpoints directly. Multiple CMS instances require an
explicit server selector; the registry never guesses. Data Processor and Data
Publisher remain registered internal composition modules without invented
client endpoints. Capability filtering uses declared ownership metadata and
never creates a parallel catalogue. Child-process IPC is used only for test
observation and adds no production diagnostics or routing API.
