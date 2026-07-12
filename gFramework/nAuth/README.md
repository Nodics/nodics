# nAuth

`nAuth` owns the framework authentication security contract. It provides JWT
issuance, bounded token defaults, secret validation, and extension points used
by `nService`, `nRouter`, and profile authentication implementations.

## Configuration

Supply `authSecurity.jwt.secret` through a project, environment, server, node,
external, or governed runtime configuration layer. Production secrets must be
at least 32 characters and must not use the development compatibility switch.
JWT issuer, audience, algorithms, access-token lifetime, and service-token
lifetime are independently overrideable beneath `authSecurity.jwt`.

Compatibility flags live under `authSecurity.compatibility`. They are explicit
migration aids, not production defaults. Projects may replace the provider or
security utility through the normal layered module hierarchy without changing
framework source.

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
before publishing the bounded JWT. The kickoff-local layer permits missing
stamps only as an explicit development/backward-compatibility exception.
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

Run `npm run test:auth-p2` for deterministic P2 contracts plus an explicitly
reported optional live Redis check. Before release, supply an isolated Redis
endpoint and run `npm run test:auth-p2:release`; absence of the endpoint fails
that gate. Test tenant and database names must contain a `test` marker.

## Deployment and migration order

1. Back up the dedicated tenant databases and verify restore procedures.
2. Configure strong JWT and API-key secrets through a later project or
   environment layer.
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
