# BackOffice browser security

This page explains the browser-security foundation implemented for Nodics Axis
and other BackOffice clients, including secure refresh restoration.

## The simple model

Axis is a browser application. Profile authenticates a human. BackOffice tells
Axis which authorized modules are available. Axis then calls those modules
directly. BackOffice is discovery and governance, not a proxy for CMS, jobs,
profiles, or other business APIs.

Human browser access, module-to-module access, and Cron execution are separate
credential families. A browser must never receive or reuse a service API key,
module token, or Cron credential.

## Audience-bound direct calls

Profile is the only token issuer. A browser access token is short-lived and
bound to the module it is intended to call. The default audience format is
`nodics-module:<moduleName>` and can be replaced by layered
`authSecurity.browserAccess.moduleAudiences` configuration.

For example, a CMS token has audience `nodics-module:cms`. CMS must reject that
token if its expected audience is BackOffice, Profile, Cron, or another
functional module. Permissions, enterprise, tenant, principal security stamp,
expiry, revocation, and token type are still validated in addition to audience.

The browser audience helpers are available now.

## Refresh-safe employee sessions

Profile owns the browser-session facade. Axis never persists access or refresh
tokens in JavaScript-readable storage. Profile returns the short-lived access
token to Axis memory and stores the refresh credential only in a scoped
`HttpOnly` cookie.

After browser refresh, Axis calls
`POST /nodics/profile/v0/employee/browser/restore`. Profile requires an exact
allowed Origin and a matching `X-CSRF-Token` header and readable CSRF cookie.
It atomically consumes the old refresh token, rotates the credential pair and
cookies, and returns only the new access token and employee identifier.

Logout revokes refresh state and expires both cookies. Invalid origin,
missing or mismatched CSRF, expired or replayed refresh state, inactive
identity, tenant mismatch, and stale security stamp all fail closed.

`profileBrowserSession` is layered configuration and is disabled by default.
Production must use `Secure` cookies and exact HTTPS origins. The local
environment explicitly enables non-Secure localhost cookies only for local
testing.

## Browser transport policy

Every browser-facing deployment must configure exact HTTPS origins. Wildcard
origins are prohibited when credentials are enabled. Nodics rejects both
preflight and actual requests from an unapproved origin and emits
`Vary: Origin`.

The shared router policy publishes:

- a restrictive API Content Security Policy that retains same-origin API
  documentation assets;
- clickjacking, MIME-sniffing, referrer, and cross-origin resource controls;
- bounded request and correlation identifiers;
- CORS allowlists for authorization, CSRF, idempotency, client-contract, and
  correlation headers;
- exposed retry, correlation, and rate-limit response headers.

OAuth or OpenID Connect integrations must use Authorization Code with PKCE,
validate `state` and `nonce`, allow only registered redirect URIs, and never put
credentials in query strings or fragments.

## Errors, retries, and idempotency

Browser clients use the Nodics `code`, HTTP `responseCode`, and safe `message`.
The shared response handler removes pipeline contexts, metadata, nested
causes, stack traces, filesystem paths, queries, and payload internals from
public error envelopes. Stack traces and secrets are not browser data.
`X-Request-Id` and
`X-Correlation-Id` connect a browser failure to server diagnostics without
revealing credentials.

Retry only safe reads automatically. Honor `Retry-After` for throttling. A
mutation may be retried only when its module contract declares idempotency and
the client supplies `Idempotency-Key`. The owning module remains authoritative
for duplicate detection and result replay.

## BackOffice bootstrap

`GET /nodics/backoffice/bootstrap` requires a human access token and
`backoffice.bootstrap.view`. The response contains only:

- active modules marked `clientCallable`;
- modules permitted for the current human;
- fields selected by `backofficeRegistry.clientSafeMetadata`;
- sanitized module-owned capability and navigation metadata;
- compatibility and observed availability.

It excludes non-browser modules, registration credentials, service tokens,
lease-expiry internals, secrets, and unrestricted infrastructure configuration.

## Verification checklist

Before enabling a browser session in an environment, test:

1. successful and failed human login;
2. expired, revoked, replayed, and wrong-audience access;
3. tenant and enterprise mismatch;
4. disallowed CORS origin;
5. logout and refresh-secret rotation;
6. rejection of service and Cron credentials on human administrative routes;
7. bootstrap permission filtering and field sanitization;
8. safe errors, correlation headers, retry guidance, and mutation idempotency.

The local `monoServer` topology is suitable for initial functional testing. A
distributed topology is required before release to prove shared refresh,
revocation, security-stamp, and registry state.

The implemented contract suite verifies successful and failed human
authentication, wrong audience, expired and revoked access tokens, single-use
refresh rotation, logout revocation of access and refresh state, cross-tenant
denial, service-versus-human separation, CORS denial, bootstrap filtering,
bounded idempotency, correlation, secret-safe audit projection, browser-cookie
creation, CSRF mismatch denial, origin denial, rotation, and logout clearing.

## Continue

- Identity and permissions: [How Users, Tenants, And Permissions Work](how-users-tenants-and-permissions-work.md)
- Security responsibilities: [Security Shared-Responsibility Model](shared-responsibility-model.md)
- Verification evidence: [Security Evidence Guide](security-evidence-guide.md)
- BackOffice backend: [BackOffice Module README](../../gExp/backoffice/README.md)
