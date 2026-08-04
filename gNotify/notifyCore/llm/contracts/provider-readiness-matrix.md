# Provider readiness matrix

| Provider | Channels | Credentials | Sandbox/local | Production status | Retry/idempotency/webhook evidence |
| --- | --- | --- | --- | --- | --- |
| localNotify | email, SMS, WhatsApp, Telegram, push, in-app | none | deterministic | prohibited | deterministic request reference; no webhook |
| SMTP candidate | email | secret reference resolved inside adapter | transport-owned | disabled, not production-ready until customer transport certification | normalized SMTP codes; provider idempotency varies; delivery webhook requires extension |
| Twilio candidate | SMS, WhatsApp | account/auth secret reference | client-owned | disabled, not production-ready until account, region, sender, consent, and callback certification | normalized retry codes and SID; idempotency/callback maturity requires customer certification |
| SendGrid, SES, SNS, Meta, FCM, APNS, Telegram | documented extension candidates | secret references | provider-specific | future/customer modules | must implement the provider-neutral adapter and readiness contract before activation |

Every activation requires tenant/enterprise scope, allowed channels/scenarios, sender identity, timeout, rate limits, retryable and terminal codes, health checks, safe test recipient policy, webhook authentication/replay defense, normalized evidence, regional/privacy review, and rollback. A package existing in source is not production certification.
