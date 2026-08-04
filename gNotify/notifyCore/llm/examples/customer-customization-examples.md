# Customer notification customization examples

## Add an email template

In the customer module, contribute a scoped `notifyTemplate` plus immutable `notifyTemplateVersion` init-data record bound to one active scenario, `email`, a permitted message type, and locale. Declare every variable in `notifyVariableDefinition`. Preview with fake samples, obtain Workflow approval when required, publish through the secured lifecycle operation, and verify Axis discovery. Never create a customer `emailTemplate` schema.

## Change OTP wording

Create a new version of the existing OTP template and edit only channel-allowed content. Keep `otpCode` protected and required. Preview must display `123456`; publishing needs independent approval under the default verification policy. Roll back by activating an earlier immutable version—never edit delivery evidence.

## Add a scenario and policy

Contribute `notify.scenarios.customerScenario` in later-layer configuration and matching governed data. Name its business owner, audience, variables, channels, message types, risk, policies, and documentation route. Add an owner context-builder service and contract tests for scope, invalid channel/type, consent, suppression, and the Axis workbench.

## Add or select a provider

Add a provider module whose adapter implements `send(message)` and returns normalized evidence. Resolve credentials by secret reference inside the adapter. Contribute provider/account records and place its code in `notify.providerSelection.providersByChannel`. A customer may replace `DefaultNotifyProviderRegistryService` to implement regional routing, but must preserve scope, health, idempotency, fallback evidence, and fail-closed behavior.

## Add customer approval or delivery policy

Override the smallest configuration key or policy service in the customer module. High-risk publication/manual resend should create or consume Workflow evidence. Technical send steps remain in the Pipeline. Add override tests showing the effective later module behavior without editing `gNotify`.
