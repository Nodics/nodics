# Local Backend Runtime Topologies

## Purpose

This environment proves that the same Nodics capabilities can run either in
one backend process or across independently started module runtimes. It contains
no BackOffice frontend and does not define a cloud deployment.

## Consolidated mode

`monoServer` listens on HTTP port `3000` and activates the configured
Nodics module groups in one process. The topology contract verifies Profile,
NEMS, Cronjob, Workflow, CMS, WCMS, DEAP data modules, and BackOffice from the
effective active-module result rather than assuming that a configured group was
loaded successfully. It also verifies that every active module self-registers
under one process identity, that the client projection contains no secret or
lease-internal fields, and that a complete `monoServer` restart reconstructs
the registry while preserving the durable CMS contract selection. The same
test performs a real HTTP employee login through Profile and uses that human
Bearer token against BackOffice. It proves successful Registry and Bootstrap
access plus rejected password, missing-token, insufficient-permission, and
service-token-on-human-administration cases.

Run:

```bash
npm run test:topology:consolidated
```

The test uses the configured local bootstrap administrator password for a new
local database. If an existing developer database still has an older governed
administrator credential, supply it only to the test process:

```bash
NODICS_TOPOLOGY_ADMIN_PASSWORD='<current-local-admin-password>' npm run test:topology:consolidated
```

Do not put that override in `package.json`, committed properties, command
history shared with others, or documentation. Rotate legacy local credentials
through the Profile identity-governance process; startup must not overwrite a
human password merely to make a test pass. Without the override, a legacy
credential mismatch is reported as `SKIPPED_LEGACY_LOCAL_CREDENTIAL`; all
non-login topology checks still run. Acceptance evidence for the human journey
requires a run that reports the six HTTP outcomes, not the skipped status.

## Modular mode

| Runtime | HTTP port | Required capability |
| --- | ---: | --- |
| `profileServer` | 3000 | Profile identity and tenant authority |
| `deapServer` | 3010 | Data Consumer, Processor, and Publisher |
| `nemsServer` | 3020 | NEMS event capability |
| `cronServer` | 3030 | Cronjob scheduling capability |
| `cmsStagedServer` | 3040 | Versioned CMS authoring, WCMS, Workflow, and nPublish |
| `workflowServer` | 3050 | Independently deployable Workflow capability |
| `backofficeServer` | 3060 | BackOffice registry and discovery |
| `cmsOnlineServer` | 3070 | Non-versioned CMS delivery target |

Run:

```bash
npm run test:topology:modular
```

For manual startup, select the environment explicitly because short server
names may also exist under Dev, QA, PreProd, or Prod:

```bash
ENV=startioLocal SERVER=profileServer node -e 'require("./nodics").start()'
ENV=startioLocal SERVER=cronServer NODE=cronNode0 node -e 'require("./nodics").start()'
```

In an interactive terminal, `SERVER=cronServer` offers matching environments.
Non-interactive execution requires `ENV` and fails rather than guessing.

The modular contract starts all listed processes, verifies their effective
module composition and readiness, exercises direct module communication,
checks BackOffice self-registration and recovery, and proves Staged-to-Online
publication behavior. CMS Staged and CMS Online register as distinct runtime
instances with different direct-call endpoints while the catalogue aggregates
them under one CMS capability. A module or BackOffice restart must reconcile
without blocking unrelated runtime traffic.

The distributed security journey logs in through `profileServer` and calls
`backofficeServer` with the resulting human Bearer token. It repeats after a
Profile restart and after a BackOffice restart, proving tenant preservation and
the same 401/403 rejection boundaries as consolidated mode. Profile restart
replaces only its runtime identity; unrelated registered identities remain.

The registry-derived direct-call journey selects and pings eight advertised
module endpoints: Profile, NEMS, Cronjob, Data Consumer, dedicated Workflow,
CMS Staged, CMS Online, and BackOffice. CMS selection without a server role is
rejected as ambiguous. Data Processor and Data Publisher are registered without
endpoints because they are internal DEAP composition, not client-callable APIs.
This prevents the registry from inventing a parallel router or exposing modules
that do not own an HTTP boundary.

## CMS Staged and Online boundary

The two CMS runtimes are separate systems, not aliases for one database.
`startioCmsStaged` contains versioned authoring data and approval state;
`startioCmsOnline` contains non-versioned published delivery state. Staged uses
the existing named module connections to publish approved CMS, Pricing, and
Product manifests. Online must never read the Staged database as a fallback.

## Configuration and customization

The authoritative local topology declaration is
`startio/envs/startioLocal/config/properties.js#test.runtimeTopology`. A project
environment may override the server list, required effective modules, and
communication checks through normal Nodics property layering. Do not add a
second launcher or hardcoded test-only module registry.

Server ports, active modules, databases, connections, and runtime roles remain
owned by the corresponding server module `config/properties.js` files. Change
the smallest environment or server property necessary; do not copy framework
lifecycle, authentication, event, publication, or registry services.

## Expected failures and recovery

- A port conflict means the other topology or a stale local process is running.
- A missing required module fails the topology contract with the runtime and
  module name instead of silently accepting partial composition.
- Missing MongoDB, Redis, Kafka, or another enabled local provider must be fixed
  at its owning configuration/provider boundary.
- A failed Staged-to-Online test must not be bypassed by sharing databases or
  copying records directly. Restore the Online runtime and retry through the
  existing Workflow and nPublish path.
- A registration delay must recover through the existing asynchronous module
  registration heartbeat; module readiness must not wait for BackOffice.
- A 401 from the positive Profile login normally means the persistent local
  administrator credential differs from the current bootstrap sample. Pass the
  current credential through `NODICS_TOPOLOGY_ADMIN_PASSWORD` or rotate it;
  never weaken BackOffice authorization or convert human routes to service access.
