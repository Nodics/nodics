# nToken

`nToken` owns the generic token lifecycle capability. It provides the token schema, generated token persistence contracts, token generation and validation pipelines, token handler delegation, validity checks, and the extension path used by capabilities such as OTP.

Use this module when changing token mechanics that are independent of one application workflow. Authentication policy, login semantics, and delivery channels belong to their owning modules; `nToken` owns reusable token generation, lookup, expiry, validation, and persistence behavior.

## Capability

The `token.token` schema stores generated tokens with:

- `key`: the business key or subject for the token;
- `ops`: the operation name the token belongs to;
- `value`: the generated token value;
- `expireAt`: expiration timestamp;
- `type`: token type such as `OTP` or `ORDER`.

The schema disables public generated routes by default. Token behavior is consumed by services and higher-level modules rather than exposed as a generic public API.

## Runtime Flow

Token generation uses `generateTokenPipeline`:

1. validate the request;
2. require `key` and `ops`;
3. apply the configured attempt limit;
4. look for an active existing token for the same key and operation;
5. reuse the active unexpired token when one exists;
6. save a new token when no valid token exists.

Token validation uses `validateTokenPipeline`:

1. validate the request;
2. require `key`, `ops`, and `value`;
3. load the latest active token for the key and operation;
4. accept matching unexpired token values;
5. deactivate expired tokens;
6. decrement the remaining limit for wrong values and deactivate the token when the limit reaches zero;
7. return token validation success or a token error.

## Source Contracts

- `src/schemas/schemas.js` owns the token schema and generated service contract.
- `config/properties.js` owns generic token defaults, including `token.TOKEN.attemptLimit`.
- `src/pipelines/pipelines.js` owns generation and validation pipeline definitions.
- `src/service/DefaultTokenService.js` starts the pipeline and passes the generated token service as `request.tokenService`.
- `src/service/handler/defaultTokenHandlerService.js` delegates token value and expiry generation to the configured token-type handler.
- `src/service/interceptor/defaultTokenValidityCheckInterceptorService.js` owns token validity interceptor behavior.

## Extension Path

Projects or capability modules may extend token behavior by:

- adding a token type enum and schema support when a new reusable token category is required;
- contributing token type configuration in `config/properties.js`;
- providing a token handler service with `generateToken` and `generateExpiry`;
- overriding pipeline services in later active modules;
- adding validation interceptors when token usage needs additional lifecycle checks.

For example, `nOtp` contributes `token.OTP` configuration and `DefaultOtpHandlerService`, while `nToken` remains the generic token lifecycle engine.

## Configuration

Token configuration must stay layered:

```js
module.exports = {
    token: {
        TOKEN: {
            attemptLimit: 5
        }
    }
};
```

Token type-specific values such as numeric range, expiration, handler service, retry limit, or single-use policy belong under the token type namespace in `config/properties.js`.

## Tests

The module owns generated schema coverage for the token schema. Token consumers such as `nOtp` add focused contract tests for route delegation and token-type behavior.

When changing token lifecycle behavior, add focused tests for:

- request validation;
- existing-token reuse;
- expiry handling;
- wrong token value decrement behavior;
- single-use token deactivation;
- handler delegation;
- project override behavior.

Run:

```bash
npm run test:generated
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- exposing generic token routes without a secured capability owner;
- hardcoding token ranges, expiry, or handlers in pipeline services;
- mixing authentication policy into token mechanics;
- changing token persistence without generated schema tests;
- bypassing `DefaultTokenService` from OTP or other token consumers;
- storing secrets or credentials in token values.
