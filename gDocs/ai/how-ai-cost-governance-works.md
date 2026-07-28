# How AI Cost Governance Works

Nodics treats AI usage limits as execution controls, not merely reports shown
after money has been spent.

This page explains the implemented AI provider and persistent token-ledger
foundation for business owners, administrators, and application developers.
Disabled OpenAI, Anthropic, and Gemini/Vertex adapters, the backend read-only
Assistant turn slice, and the documentation-focused Knowledge/RAG slice are now
implemented. Browser APIs, Axis rendering, governed mutation tools, and
production provider activation are later phases.

## Why A Business Needs This

AI requests can vary greatly in size and price. During a busy business event,
many users or automated processes may issue requests at the same time. A simple
monthly report cannot prevent those concurrent requests from exceeding an
approved budget.

The Nodics foundation:

1. estimates tokens and exact cost before execution;
2. reserves available capacity;
3. rejects a request when its governed scope has insufficient capacity;
4. records actual normalized usage;
5. retains ambiguous usage when the provider may already have processed it;
6. keeps tenant-scoped audit evidence.

This helps partners provide per-tenant, enterprise, application, employee,
usage-profile, provider, or model controls without embedding vendor logic in
their business modules.

## A Simple Example

An enterprise gives its Axis application a monthly AI ceiling. An employee
starts an Assistant request estimated at 100 tokens.

- If capacity exists, Nodics creates one idempotent reservation before calling
  a provider.
- If the provider uses 50 tokens, the reservation is reconciled to 50 consumed
  tokens.
- If the browser retries the same request, the same reservation is reused.
- If the limit is reached, the request is rejected before provider invocation.
- If a timeout occurs after provider invocation may have started, the
  reservation remains uncertain rather than being incorrectly treated as free.

## What Administrators Can Do

Authorized operators can:

- inspect tenant-bound budget windows;
- inspect reservation state;
- inspect immutable normalized usage;
- increase or safely reduce a ceiling, provided it remains above current
  commitments;
- run bounded stale-reservation expiry through an internal service identity.

The current permissions are `ai.ledger.read`, `ai.ledger.manage`, and the
configured internal service-token permission for expiry.

## What Is Configurable

Partners can configure:

- daily or monthly UTC windows;
- which scope dimensions form a budget;
- default token and exact-cost ceilings;
- reservation expiry;
- uncertain-usage retention;
- expiry batch size;
- concurrency retry limits.

Configuration belongs in layered `properties.js`. Provider credentials do not
belong in ledger configuration.

## Security And Accuracy

- Tenant and principal identity come from authenticated request context.
- Provider and model come from the configured provider profile.
- Pricing uses revisioned exact decimal strings.
- Cost decisions never use JavaScript floating point.
- Persistent data is authoritative; cache cannot approve capacity.
- Generated CRUD APIs are disabled for ledger models.
- Usage evidence must not contain provider credentials or sensitive prompt
  content.

## Important Current Limitations

The implemented foundation does not yet include:

- live OpenAI, Anthropic, or Gemini adapters;
- automatic provider lookup for uncertain usage;
- multiple independent hierarchical ceilings applied in one transaction;
- metrics dashboards and alert rules;
- nCache-based read-only reporting acceleration.

These limitations remain visible so evaluators do not mistake planned behavior
for delivered functionality.

Nodics now provides bounded, dry-run-first repair scans for interrupted
`RECONCILING` and `RELEASING` transitions. It persists repair runs/findings,
reconstructs exact counters from evidence, and accepts positive provider usage
evidence for uncertain reconciliation. It never treats missing evidence as
proof that usage was free.

## For Developers

The owning module is `gAi/aiProviders`. Business modules call only its
provider-neutral gateway and never choose a vendor directly.

To customize policy:

1. create or use the customer project's later-loaded module;
2. override the `aiProviders.ledger` subtree in `config/properties.js`;
3. preserve tenant scope, exact arithmetic, idempotency, CAS, immutable usage,
   and uncertain-state safety;
4. add default, rejection, concurrency, recovery, tenant-isolation, and
   customization tests;
5. regenerate module context.

Do not copy the framework ledger service, edit generated files, introduce an
AI-specific cache engine, or write directly to ledger collections.

## Continue

- Detailed business, operator, and developer guide:
  Persistent AI Token Ledger Guide (canonical documentation: `capability.ai.technical-reference`)
- Owning module: [AI Providers](../../gAi/aiProviders/README.md)
- Security model: [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- Documentation home: [Nodics Documentation](../README.md)
