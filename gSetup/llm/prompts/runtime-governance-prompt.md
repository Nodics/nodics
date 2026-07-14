# Nodics Runtime Governance Prompt

Use this prompt when changing runtime configuration, tenant properties, router
configuration, schema configuration, schema access policy, activation requests,
audit history, cleanup, rollback, or admin/control-plane behavior.

```text
Implement or review this Nodics runtime-governed behavior through the existing
control-plane lifecycle.

Load the base Nodics assistant prompt, affected module context,
artifact-definition-and-change-guide.md, tenant-model-and-runtime-isolation.md,
and testing-and-release-contract.md. For security-sensitive changes, also load
the developer implementation and integration governance contracts.

Classify the governed artifact:
- schemaConfiguration
- routerConfiguration
- propertyConfiguration
- schemaAccessPolicy
- integration/provider configuration
- tenant/environment/server/node runtime behavior

Runtime governance requirements:
- preview before mutation
- approval or explicit safe path where required
- activation through the owning service
- immutable approval intent and payload integrity for submitted patches
- audit records with actor, tenant, correlation id, risk, previous snapshot,
  next snapshot, warnings, and failure details
- rollback through the owning service, not direct state mutation
- diagnostics and cleanup behavior with safe defaults
- route/action permissions and tenant isolation

Do not add a parallel activation channel. Add a new configuration type to the
existing lifecycle only when it has a clear owner, validation, preview, audit,
rollback, tests, documentation, and generated LLM context.
```
