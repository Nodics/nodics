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
provide atomic single-use semantics.

## Identity governance

`identityGovernance` defines layered administrative groups, trusted framework
service groups, safe customer-registration defaults, and the permission-code
catalog. Projects extend these values through normal configuration hierarchy;
core services consume `DefaultIdentityGovernanceService` rather than embedding
project role names.

Human, customer, and service principals are distinct categories. API keys are
restricted to service principals, while group inheritance must remain active,
acyclic, and composed only from catalogued permissions.

Security-stamp validation is enabled by `authSecurity.securityStamp`. It is
fail-closed by default and compares each human/customer access token with the
current tenant-scoped principal stamp. The kickoff-local layer permits missing
stamps only as an explicit development/backward-compatibility exception.
Strict deployments must configure the `profile.auth` cache channel with a
shared engine such as Redis or Hazelcast and disable local fallback; startup
fails when strict validation detects a node-local cache.

Principal updates resolve persisted records before assigning stamps, ensuring
tokens and cache entries use the same stable `loginId`. Group changes invalidate
direct members and members of every descendant group in the inheritance graph.

Identity migration permissions and separation-of-duties rules are layered
under `identityGovernance`. By default, a runtime configuration requester may
not decide or activate the same request, and its approver may not activate it.
Projects may integrate a workflow engine by overriding the corresponding
services while preserving these governance outcomes.
