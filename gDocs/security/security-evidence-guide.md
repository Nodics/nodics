# Security Evidence Guide

This page is for security architects, principal engineers, auditors, operators,
and expert evaluators. It maps security claims to implemented Nodics contracts
and explains what must still be proven by the customer solution.

## Evidence Rule

A security statement is acceptable only when it identifies:

1. the authoritative module or configuration;
2. the enforcement boundary;
3. positive and negative behavior;
4. tenant and topology implications;
5. failure behavior;
6. executable tests or operational evidence;
7. project/provider responsibilities and limitations.

Documentation is guidance, not proof by itself. Generated OpenAPI, source
contracts, test results, configuration reports, runtime readiness, audit data,
and deployment evidence must agree.

## Implemented Control Map

| Control objective | Nodics authority and enforcement | Evidence examples | Customer proof still required |
| --- | --- | --- | --- |
| Human authentication | `nAuth`, Profile, secured request pipeline | Auth security, login-route, token-isolation, revocation tests | Selected IAM/CIAM, MFA/session policy, lifecycle operations |
| Service identity separation | Service tokens, route `authTokenTypes`, internal-token permission | Route authorization and modular token tests | Service inventory, token distribution, transport protection |
| Action authorization | Router permission metadata and permission catalog | Route-action and control-plane permission contracts | Role design, assignments, access reviews, segregation of duties |
| Tenant/enterprise isolation | Trusted auth context carried through business/data services | Profile, cache, import, generated access-policy, module tests | Project code review and dedicated customer isolation scenarios |
| API surface reduction | `apiExposure` before help/controller dispatch | Request-pipeline and route contracts | Production server/category configuration and gateway exposure |
| HTTP hardening | nRouter hardening service and layered properties | CORS, headers, body, rate, proxy tests | TLS/WAF/DDoS/gateway capacity and trusted-proxy validation |
| Secret bootstrap | Governed bootstrap source and insecure-source compatibility gate | Profile/auth/import bootstrap contracts | Secret manager, rotation, emergency procedure, no CI leakage |
| Secret-safe output | Central logger redaction and bounded diagnostics | Logger-redaction and diagnostics contracts | Project logger review, sink access, retention and alert rules |
| Runtime governance | nDynamo preview/request/approval/activation/audit/rollback | Runtime governance suites | Approver assignment, environment separation, audit retention |
| Cache isolation | nCache tenant/security keying and provider contract | Local/Redis isolation, mutation, invalidation tests | Selected engine hardening, shared-state topology, eviction/capacity |
| Publishing integrity | Workflow plus nPublish; distinct Staged and Online runtimes | CMS/Product/Pricing publication and rollback tests | Production transport, Online isolation, backup and reconciliation |
| Operational health | nSystem liveness/readiness and sanitized contributors | Health route and topology tests | Monitoring, paging, SLOs, provider-specific readiness |
| Release quality | Build, documentation, generated context, basic/full and release gates | `npm run build`, `test:basic`, `test:full`, `release:check` | Independent CI execution, artifact integrity, approval records |

## Identity And Trust Boundaries

Nodics keeps these identities separate:

- **Human access token:** represents a logged-in person and is constrained by
  user groups, permissions, tenant, token state, and security stamp.
- **API key:** represents a governed API principal and scope; it is not a
  substitute for a human password.
- **Module service token:** represents runtime-to-runtime communication and is
  accepted only by routes designed for service identity.
- **Scheduled execution:** uses CronJob ownership and an appropriate service or
  human identity for the action it invokes.
- **Public context handle:** where implemented, is an opaque, short-lived bearer reference,
  audience-bound, and introspected by an authenticated module. It grants no
  mutation authority.

Reviewers should reject designs that convert one identity type into another,
make internal APIs public, or accept tenant/enterprise authority from an
untrusted browser field.

## Tenant Isolation Review

Trace at least one business identifier through:

```text
HTTP request
  -> authentication or trusted public-context establishment
  -> route permission and token-type decision
  -> service enterprise validation
  -> DAO/database tenant selection
  -> cache and search partition
  -> events, jobs, import/export and audit
  -> response projection and logs
```

Test the correct tenant, wrong tenant, absent tenant, conflicting enterprise,
cross-tenant identifier, cache hit, cache miss, provider outage, background
execution, and modular transport. A tenant header alone must never create or
broaden authority.

## Failure And Abuse Review

Every protected capability should answer:

- What happens when credentials are missing, expired, revoked, malformed, or
  of the wrong type?
- What happens when the permission catalog, auth cache, Profile, Storefront,
  database, distributed cache, search, event broker, or target module is down?
- Are retries limited to safe/idempotent operations?
- Can a circuit breaker or fallback bypass authorization?
- Does an error disclose tenant names, URLs, tokens, keys, cached values, stack
  traces, or confidential payloads?
- Can request size, graph depth, result count, concurrency, or queue growth
  exhaust the service?
- Is recovery automatic, auditable, and tested without editing authority data?

Security-sensitive uncertainty must deny the protected action. Availability
fallback is acceptable only when another path preserves the same authority and
security contract.

## Verification Commands

```bash
npm run test:basic
npm run test:full
npm run quality:docs
npm run llm:validate
npm run build
npm run release:check -- --execute --full
```

Focused suites and contracts include authentication, authorization, HTTP
hardening, tenant-aware cache, runtime governance, route contracts, generated
schema access, Profile identity, Storefront context, and modular topology.
Provider-specific live tests must be run when the deployment depends on that
provider; deterministic mocks alone do not qualify external infrastructure.

## Security Review Deliverables

An enterprise review should retain:

- architecture and data-flow diagrams;
- data classification and tenant placement;
- route/OpenAPI inventory and exposure categories;
- identity, role, permission, and service-account matrix;
- effective environment/server/node configuration with secrets removed;
- threat model and misuse cases;
- test and release-gate reports;
- provider qualification and maturity decisions;
- vulnerability and dependency report;
- backup/restore and failover evidence;
- log/audit retention and access model;
- incident and rollback procedures;
- accepted risks, accountable owner, and review expiry.

## Standards And Compliance Position

Nodics principles align with common enterprise practices such as least
privilege, explicit verification, defense in depth, secure failure, separation
of duties, auditable change, and resource-local enforcement. Alignment is not
certification. Map the implemented controls and deployment evidence to the
specific standard or regulation selected by the organization, then obtain the
required independent review.

## Continue

- Executive context: [Why Businesses Can Trust Nodics](../business/security-and-trust.md)
- Responsibility assignment: [Security Shared-Responsibility Model](shared-responsibility-model.md)
- Identity and tenant implementation: [How Users, Tenants, And Permissions Work](how-users-tenants-and-permissions-work.md)
- Provider qualification: [Provider And Capability Maturity Matrix](../reference/provider-capability-maturity-matrix.md)
- Testing: [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
