# Notification Framework Contract

## Business and decision model

A scenario explains *why* communication occurs and remains owned by its business capability. A channel explains *how* a recipient sees it. A message type supplies governance. A centralized template binds exactly one scenario, channel, message type, locale, and scope. A provider is replaceable delivery infrastructure. This separation prevents vendor lock-in, duplicated templates, and hidden consent rules.

Transactional and security communication may be essential but remains rate-limited and auditable. Marketing fails closed without Profile/Customer-owned consent. High-risk message types require independent Workflow approval. Suppression is a successful governed outcome, not an exception to bypass.

## Developer path

Call `DefaultNotifyDeliveryService.send(request, intent)` with authenticated tenant/enterprise scope, an idempotency key, scenario/channel/message type, owner module/reference, correlation id, recipient reference plus masked display, locale, and declared values or an owner context builder. The delivery Pipeline validates policy and abuse limits, resolves consent, template and declared variables, renders transient content, selects a healthy account, persists request evidence, sends, normalizes an attempt, and publishes a content-free event.

Business context builders may be replaced in a customer module. They return only declared variables. Provider adapters implement `send(message)` and return normalized status, reference, result code, and bounded safe evidence. Credentials are secret references resolved inside an adapter; they never enter templates, Axis records, logs, or delivery evidence.

## Verification

`notifyVerification` asks `nOtp` to generate/validate single-use challenges and passes the raw value directly to transient rendering. Its public result contains only challenge code, expiry, delivery request code, and status. Provider-managed OTP is disabled unless an explicit customer policy and adapter enable it. KYC owns verification business state; `gNotify` owns delivery; `nOtp` owns the secret.

## Axis and operations

Axis discovers Templates, Scenarios, Channels, Message Types, Providers, Provider Accounts, Delivery Logs, Attempts, Suppressions, Verification, and In-App Inbox from BackOffice capability metadata. Permissions, schema contracts, filters, lifecycle actions, preview, test-send, and documentation anchors remain backend-owned. Raw secrets and real OTP previews are forbidden.

Operators investigate by correlation id -> delivery request -> immutable attempts. Retry only `RETRY_SCHEDULED` results within configured bounds. Rehydrate values from the business owner instead of persistence. Use Workflow for approval, provider outage review, manual resend, escalation, and customer-support handoff. Circuit breaking and fallback must remain policy-controlled; do not silently change channel when consent or recipient expectations differ.

## Customer customization

Override `notify` configuration at project/environment/server/node/tenant/customer layer; seed scoped scenarios/templates/provider accounts; replace consent, context-builder, provider adapter, selection, retry, or event services in a higher module; or extend Pipeline nodes. Preserve identities, scope enforcement, idempotency, immutable evidence, redaction, central template authority, and owner boundaries. A customization is incomplete until backend contracts, Axis discovery, docs, generated LLM context, tests, and rollback/recovery are verified.

## Failure and scale cases

- Missing consent: persist suppression evidence and publish `NOTIFICATION_SUPPRESSED`.
- Invalid placeholders or protected preview: reject before provider selection.
- Provider timeout: normalize retryability, persist the attempt, apply configured backoff/circuit breaker/fallback.
- Duplicate request/callback: return existing evidence by idempotency identity.
- Partial outage: preserve owner correlation, expose safe diagnostics, and route long-running recovery to Workflow.
- High volume: bound recipients, variables, evidence size, template size, query limits, attempts, and rate windows; partition/retain delivery evidence by customer policy.
