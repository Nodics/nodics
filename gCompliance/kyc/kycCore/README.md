# KYC Core

KYC Core owns scoped verification profiles, cases, requirements, safe document references, consent, checks, immutable decisions, review tasks, audit evidence, policy evaluation, eligibility decisions, and verification/manual-review Workflow handoff.

The default first slice supports customer and employee identity verification. A caller submits consent and private nMedia codes to the secure case intent API. The submit Pipeline resolves effective policy, validates scope/consent/media references, persists reference-only evidence, and starts the configured Workflow. Reviewers use explicit actions; sensitive generated CRUD mutation remains disabled. Checkout, Payment, Refund, Order, and Profile ask the policy service for eligibility and never copy KYC rules.

Configuration lives under `kyc.*`: policy levels, entry points, thresholds in exact minor-unit strings, expiry/retention/masking, reusable decisions, maker-checker, provider execution, Workflow codes, rate limits, and safe errors. A customer module overrides only the smallest later-layer difference. It may contribute a verification level, provider registration, policy service, Pipeline node, Workflow definition, validation service, or Axis metadata while preserving KYC ownership and private evidence contracts.

Never store raw documents, paths, provider payloads, OCR, biometrics, credentials, or unmasked identifiers here. Documents remain private nMedia assets and browser delivery must be purpose-bound and audited. Final decisions, checks, consent, and audit events are append-only/immutable.

Detailed architecture, business journeys, schema/API contracts, customization examples, operations, recovery, and test evidence are in `llm/contracts/kyc-compliance-contract.md`. Run focused KYC tests, `npm run structure:audit -- --fail`, `npm run llm:generate`, and `npm run llm:validate` after changes.
