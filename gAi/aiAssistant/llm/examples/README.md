# Assistant Configuration Example

To tighten the mutation confirmation window in a later layer:

```js
module.exports = {
    aiAssistant: {
        confirmations: {
            ttlSeconds: 300,
            executionTimeoutMs: 3000
        }
    }
};
```

Do not store approvals in the browser, copy the confirmation service, bypass
Profile authorization, or implement another Workflow state machine.

A later project or environment layer may contribute:

```js
module.exports = {
    aiAssistant: {
        enabled: true,
        providerProfile: 'projectAssistantGeneration'
    }
};
```

This is an override fragment, not a replacement configuration. Never put the
provider or credential values here and never copy the AI Assistant module.

Grant the smallest action permissions to an employee group in the owning
project rather than weakening route security:

```text
ai.assistant.use
ai.assistant.read
ai.assistant.cancel
```

An authenticated request may submit:

```json
{
  "message": "Find the Profile enterprise documentation",
  "idempotencyKey": "axis-turn-00000001"
}
```

Do not include tenant, principal, provider, model, credentials, or target
authorization, prompt code, or provider profile in this body. Nodics derives
identity from authentication, resolves the approved prompt and provider profile
from the enabled Assistant Definition, and selects the vendor through
`aiProviders`.
