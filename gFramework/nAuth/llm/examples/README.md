# nAuth AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `gFramework/nAuth` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Example: enabling strict Redis-backed auth state

A project, environment, server, or node module should enable strict auth cache
state through layered properties, not by changing `nAuth` source:

```js
module.exports = {
    cache: {
        enabled: true,
        profile: {
            channels: {
                auth: {
                    enabled: true,
                    engine: 'redis',
                    fallback: false
                }
            },
            engines: {
                redis: {
                    enabled: true,
                    distributed: true,
                    atomicConsume: true,
                    url: process.env.NODICS_AUTH_REDIS_URL
                }
            }
        }
    }
};
```

If any activation flag is disabled, strict auth startup must fail before traffic
is accepted.
