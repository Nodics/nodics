# nOtp

`nOtp` owns one-time-password capability support on top of the generic `nToken` lifecycle. It provides secured OTP routes, controller and facade mapping, OTP generation and validation services, OTP token configuration, and the default OTP handler.

Use this module for framework-level OTP mechanics. Customer-specific challenge flows, delivery channels, identity flows, notification templates, and policy tuning should be contributed through project modules and layered configuration.

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
