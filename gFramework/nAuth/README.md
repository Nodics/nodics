# nAuth

`nAuth` answers the question, “Who or what is making this request, and can that
identity still be trusted?” It supplies the framework security contracts used
to issue and validate bounded credentials while keeping people, internal
services, and API-key principals distinct.

`nAuth` owns the framework authentication security contract. It provides JWT
issuance, bounded token defaults, secret validation, and extension points used
by `nService`, `nRouter`, and profile authentication implementations.

## Credential Boundaries

Nodics has separate credential purposes:

| Credential flow | Intended caller | Important boundary |
| --- | --- | --- |
| Username/password login | A human user | Profile owns login and principal lookup; credentials must not be reused by modules or jobs. |
| Human access token | An authenticated person | Authorization and tenant context still apply at every target route. |
| Internal service token | A module or controlled scheduled process | Issued through service identity, bounded, tenant-aware, and authorized by internal route permissions. |
| API key | A governed service principal | Stored as a keyed digest with scoped policy; never place raw keys in tokens, logs, or audit. |
| Refresh token/session | A human session rotation flow | Profile persistence plus atomic single-use cache consumption prevents concurrent replay. |

Authentication proves an identity. Authorization decides whether that identity
may perform an action. API exposure decides whether the route family exists in
the active topology. These are related but separate gates.

## When To Use This Module

Change `nAuth` when the reusable JWT, API-key, security-stamp, service-token,
identity-governance, replay, revocation, or distributed authentication-state
contract changes. Keep login workflows and persisted people in `gCore/profile`;
keep generic token mechanics in `nToken`; keep route authorization metadata in
the owning router module.

## Configuration

Supply `authSecurity.jwt.secret` through a project, environment, server, node,
external, or governed runtime configuration layer. Production secrets must be
at least 32 characters and must not use the development compatibility switch.
JWT issuer, audience, algorithms, access-token lifetime, and service-token
lifetime are independently overrideable beneath `authSecurity.jwt`.

Browser clients use module-specific audiences through
`DefaultAuthSecurityService.getBrowserAudience`. Browser exchange is disabled
by default until the Profile-owned cookie session facade is enabled. See
[`gDocs/security/backoffice-browser-security.md`](../../gDocs/security/backoffice-browser-security.md).

Compatibility flags live under `authSecurity.compatibility`. They are explicit
migration aids, not production defaults. Projects may replace the provider or
security utility through the normal layered module hierarchy without changing
framework source.

Bootstrap identity credentials are governed by `authSecurity.bootstrapIdentity`.
Profile init data calls the nAuth bootstrap validation contract before it emits
the active `admin` and `apiAdmin` records. A project, environment, server, or
node layer must provide `bootstrapIdentity.source`, `adminPassword`,
`servicePassword`, and `serviceApiKey`. Production-like sources should be named
from governed locations such as `environment`, `externalProperty`,
`secretManager`, or `runtimeSecret`. Local/test sources such as `localSample`
and `test` are rejected unless
`authSecurity.compatibility.allowLocalBootstrapIdentity` is explicitly enabled.

Refresh-token persistence and principal lookup remain profile capabilities.
Access tokens never contain API keys, passwords, or refresh tokens.

`authSecurity.apiKey.pepper` is mandatory outside explicit compatibility
environments. `DefaultAPIKeyCredentialService` converts client-generated keys
to keyed digests before persistence; only a non-secret prefix is retained for
operator identification. Plaintext lookup exists solely behind the explicit
legacy migration flag and must be disabled after migration.

Refresh sessions are consumed through the cache engine's atomic `consume`
contract before rotation. Cache integrations must fail closed when they cannot
provide atomic single-use semantics. Redis is the supported distributed auth
engine and uses the Redis 6.2+ `GETDEL` primitive. The current `hazelcast`
module is a non-distributed compatibility placeholder and is rejected by strict
auth configuration until a real distributed adapter supplies atomic take.

## Identity governance

`identityGovernance` defines layered administrative groups, trusted framework
service groups, safe customer-registration defaults, and the permission-code
catalog. Projects extend these values through normal configuration hierarchy;
core services consume `DefaultIdentityGovernanceService` rather than embedding
project role names.

Internal-token route authorization is also layered. The default route
permission is `authSecurity.internalToken.routePermission`, which resolves to
`auth.internal.token.read`; cross-tenant token access is governed separately by
`authSecurity.internalToken.crossTenantPermissions`.

Human, customer, and service principals are distinct categories. API keys are
restricted to service principals, while group inheritance must remain active,
acyclic, and composed only from catalogued permissions.

Security-stamp validation is enabled by `authSecurity.securityStamp`. It is
fail-closed by default and compares every human, customer, and internal service
token with the current tenant-scoped principal stamp. Internal tokens must be
issued through `DefaultServiceTokenService`, which registers the service stamp
before publishing the bounded JWT. Local development layers may permit missing
stamps only as explicit development/backward-compatibility exceptions.
Strict deployments must configure the `profile.auth` cache channel with a
distributed engine whose metadata declares atomic consume support, must keep
the global cache subsystem, auth channel, and selected engine enabled, and must
disable local fallback; startup fails otherwise. A Redis URL or engine
definition alone is not an activation signal.

Principal updates resolve persisted records before assigning stamps, ensuring
tokens and cache entries use the same stable `loginId`. Group changes invalidate
direct members and members of every descendant group in the inheritance graph.

Identity migration permissions and separation-of-duties rules are layered
under `identityGovernance`. By default, a runtime configuration requester may
not decide or activate the same request, and its approver may not activate it.
Projects may integrate a workflow engine by overriding the corresponding
services while preserving these governance outcomes.

## P2 threat and acceptance contract

The P2 boundary assumes attackers may replay refresh tokens concurrently,
present a valid token in another tenant, retain a token after a principal or
group change, use an expired/revoked/unscoped API key, inspect audit output for
secrets, or exploit a partially failed migration. It also assumes modular nodes
can race against the same shared state.

Acceptance requires exactly one successful refresh exchange, tenant-keyed
security stamps, immediate human and service token rejection after a stamp
change, least-privilege API-key policy, credential-free audit records, and a
preview/apply/repeat/fail/rollback migration lifecycle that never restores a
plaintext credential.

Run `npm run test:suite -- --suite=auth-p2` for deterministic P2 contracts plus
an explicitly reported optional live Redis check. Before release, supply an
isolated Redis endpoint and run `npm run test:auth-p2:release`; absence of the
endpoint fails that gate. Test tenant and database names must contain a `test`
marker.

## Deployment and migration order

1. Back up the dedicated tenant databases and verify restore procedures.
2. Configure strong JWT, API-key pepper, and bootstrap identity secrets through
   a later project, environment, server, node, external, or secret-manager
   layer.
3. Configure the profile auth channel to use Redis with local fallback disabled.
4. Run P2 contracts and the required live Redis release test.
5. Preview identity migration and retain its correlation identifier.
6. Apply migration to one test tenant, inspect the redacted audit, and repeat to
   prove `NO_CHANGES`.
7. Rotate every service credential reported by the migration before enabling
   traffic. Never distribute keys through logs or migration responses.
8. Deploy profile first, then dependent modular nodes, and verify service-token
   rotation and authorization.
9. Roll back only through the audited change set. Rollback intentionally does
   not restore plaintext credentials; affected service keys must be rotated.

## Failure, Observability, And Performance

- Fail closed when secrets, distributed atomic state, tenant context, stamp
  state, scope, or required permission cannot be trusted.
- Record safe reason codes, tenant, principal identity, credential type,
  correlation, cache/provider state, and decision outcome without recording
  usable credentials.
- Keep access-token checks bounded and cache-backed where the strict contract
  requires shared revocation state.
- Treat cache unavailability and partial migration as security events, not as a
  reason to enable an in-memory fallback in strict deployments.
- Monitor invalid credentials, replay attempts, stamp mismatches, API-key
  expiry/revocation, authorization denial, and migration failures.

## Verification

```bash
node gFramework/nAuth/test/authSecurityContract.test.js
npm run test:suite -- --suite=auth-p2
npm run quality:docs
```

Before a production release, run `npm run test:auth-p2:release` with an isolated
Redis endpoint. Verify positive access, invalid signature, expiry, replay,
revocation, cross-tenant denial, missing permission, service identity, audit
redaction, and shared-state behavior.

## Common Mistakes

- Reusing username/password login for modules, cron jobs, or BackOffice
  registration.
- Treating a valid token as permission to perform every action.
- Enabling local auth-cache fallback in a strict modular deployment.
- Logging tokens, API keys, refresh sessions, cache keys, or bootstrap secrets.
- Hardcoding a project role or internal permission in a framework route.
- Deploying dependent modules before the profile/service-identity boundary is
  ready and verified.

## Continue

- Public security guide: [How Users, Tenants, And Permissions Work](../../gDocs/security/how-users-tenants-and-permissions-work.md)
- Human and service principals: [profile](../../gCore/profile/README.md)
- Generic token lifecycle: [nToken](../nToken/README.md)
- HTTP authorization: [nRouter](../nRouter/README.md)
