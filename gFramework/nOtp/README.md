# nOtp

`nOtp` creates and checks a short-lived one-time password for a specific
operation. It builds on `nToken` and deliberately does not decide how the code
is delivered or what business journey the challenge unlocks.

`nOtp` owns one-time-password capability support on top of the generic `nToken` lifecycle. It provides secured OTP routes, controller and facade mapping, OTP generation and validation services, OTP token configuration, and the default OTP handler.

Use this module for framework-level OTP mechanics. Customer-specific challenge flows, delivery channels, identity flows, notification templates, and policy tuning should be contributed through project modules and layered configuration.

## When To Use This Module

Use `nOtp` when an application needs a numeric, short-lived challenge behind a
secured API. Use `nToken` directly for a different reusable token type. Keep
email, SMS, push, messaging, templates, consent, and identity recovery in their
own capability or project modules.

## Capability

The module exposes two secured route operations:

- `POST /nodics/otp/generate` through `DefaultOtpController.generateOtp`;
- `POST /nodics/otp/validate` through `DefaultOtpController.validateOtp`.

Both routes are secured and currently use `userGroup` access. The route help metadata prefers `Authorization: Bearer <token>` and keeps `authToken` wording only as compatibility guidance.

## Runtime Flow

OTP generation:

1. The controller copies `request.httpRequest.body` into `request.model`.
2. The facade delegates to `DefaultOtpService.generateOtp`.
3. The service stamps `request.model.type = 'OTP'`.
4. `DefaultTokenService.generateToken` runs the token generation pipeline.
5. `DefaultOtpHandlerService.generateToken` creates the numeric OTP from configured range.
6. `DefaultOtpHandlerService.generateExpiry` computes expiration from configured validity seconds.

OTP validation:

1. The controller copies the request body into `request.model`.
2. The facade delegates to `DefaultOtpService.validateOtp`.
3. `DefaultTokenService.validateToken` runs the token validation pipeline.
4. Token expiry, value matching, attempt limit, and deactivation behavior are handled by `nToken`.

## Source Contracts

- `config/properties.js` owns `token.OTP` defaults: range, validity, attempt limit, and token handler.
- `src/router/routers.js` owns the secured OTP route metadata.
- `src/controller/DefaultOtpController.js` owns request-body mapping.
- `src/facade/DefaultOtpFacade.js` owns API boundary delegation.
- `src/service/DefaultOtpService.js` owns OTP type stamping and token-service delegation.
- `src/service/handler/defaultOtpHandlerService.js` owns default OTP value and expiry generation.
- `test/otpCapabilityContract.test.js` verifies route metadata, controller mapping, service delegation, OTP type stamping, and handler configuration behavior.

## Configuration

Default OTP configuration:

```js
module.exports = {
    token: {
        OTP: {
            rangeStart: 1000,
            rangeEnd: 9000,
            validUpTo: 300,
            attemptLimit: 5,
            tokenHandler: 'DefaultOtpHandlerService'
        }
    }
};
```

Projects may override these values in later active modules. A project that needs a different OTP algorithm should contribute a different handler service and point `token.OTP.tokenHandler` to that service.

## Extension Path

Projects may customize OTP behavior by:

- overriding `token.OTP` configuration;
- contributing a different OTP handler service;
- overriding facade or service methods through later active modules;
- adding delivery behavior in a project-owned notification, email, SMS, or messaging module;
- adding route permission changes through governed route configuration when access policy changes.

Do not put one customer delivery workflow into the framework default. OTP generation and validation are framework capabilities; delivery and business challenge flow are application concerns.

## Security And Production Qualification

The default secured routes and attempt/expiry behavior are only part of a
production OTP solution. The owning application must define:

- who is allowed to request and validate a challenge;
- operation, tenant, subject, and session binding;
- request throttling and abuse detection across relevant identity, address,
  device, and destination signals;
- resend/cooldown rules and concurrent-request behavior;
- delivery-provider security, privacy, retry, and failure handling;
- whether a successful validation is consumed atomically;
- audit and user notification for sensitive account actions.

Do not expose the generated OTP in logs, metrics, audit, error responses, or a
production API response. If local development needs display behavior, keep it
behind an explicit non-production override and test that production-like
topologies reject it.

## Tests

Run focused OTP coverage with:

```bash
node gFramework/nOtp/test/otpCapabilityContract.test.js
npm run test:basic
npm run quality:docs
```

Add tests when changing:

- route security or permission metadata;
- controller body mapping;
- token type stamping;
- OTP range or expiry behavior;
- token service delegation;
- project override behavior.

## What To Avoid

Avoid:

- treating OTP as `nOpt`; the module is `nOtp` and the optional group is `gOptional`;
- exposing OTP routes without secured metadata;
- hardcoding delivery channels in framework OTP services;
- bypassing `nToken` token lifecycle behavior;
- logging generated OTP values in production diagnostics;
- changing OTP policy without configuration and tests.

## Observability And Failure Behavior

Observe safe counts and latency for generation, validation, expiry, exhausted
attempts, throttling, delivery outcome, and provider failure. Avoid sensitive
destinations and token values in metric labels. Provider failure must not leave
an apparently delivered challenge without a traceable outcome; repeated
requests must follow the application's resend and idempotency policy.

## Continue

- Generic lifecycle: [nToken](../nToken/README.md)
- Authentication boundary: [nAuth](../nAuth/README.md)
- Public security guide: [How Users, Tenants, And Permissions Work](../../gDocs/security/how-users-tenants-and-permissions-work.md)
- Framework map: [gFramework](../README.md)
