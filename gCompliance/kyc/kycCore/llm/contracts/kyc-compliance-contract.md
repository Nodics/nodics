# KYC compliance capability contract

## Business overview

KYC verifies an individual; KYB verifies a business and its owners. AML, sanctions, PEP, adverse-media, and transaction monitoring identify financial-crime risk. Consent records permission to process sensitive evidence. A check is one result, a case is one verification attempt, a profile summarizes current eligibility, and a decision is immutable evidence. Profile identity answers “who is this account?”; KYC answers “what governed verification evidence supports allowing this operation?”

The implemented first slice is individual customer/employee KYC. KYB and AML/sanctions are not live capabilities: future owning modules can join at the published Pipeline and Workflow extension points, but callers must not store screening results in generic fields or call a provider directly.

## End-to-end journey and ownership

1. Profile resolves a subject reference but never owns KYC state.
2. A customer app or Axis uploads evidence to nMedia's private `kycDocuments` purpose and receives a `mediaCode`.
3. The caller accepts active versioned consent and invokes `POST /kyc/cases/submit` with tenant, enterprise, subject, entry point, idempotency/correlation IDs, consent, and private media references.
4. `submitKycCasePipeline` resolves policy, validates scope/consent/media, builds masked reference-only evidence, persists it, and starts the configured KYC Workflow.
5. Provider adapters translate protocols. KYC stores only normalized references/status/reasons. Callbacks require a signature-verified, replay-protected, tenant-mapped envelope.
6. Workflow routes inconclusive/high-risk work to review. Reviewers request information, escalate, approve, or reject through explicit actions. Overrides, rejection reversals, high-risk approvals, and exceptions require different maker/checker principals by default.
7. Profile, Checkout, Payment, Refund, and Order consume KYC eligibility while retaining their lifecycle authority.
8. Expiry or risk/policy change starts re-verification; historic final decisions remain immutable.

## Business procedures

For onboarding, upload requested private documents, confirm consent, submit, and follow the case. `DOCUMENTS_REQUIRED` lists missing types; add replacement evidence and resubmit. `PROVIDER_PENDING` waits for a callback. `MANUAL_REVIEW_REQUIRED` enters the queue. `APPROVED`, `REJECTED`, `EXPIRED`, and `CANCELLED` are terminal evidence.

For checkout/payment/refund/order, the owner asks KYC eligibility. An unexpired approved decision may be reused only under configured tenant, enterprise, scope, and entry-point rules. Otherwise KYC returns `VERIFICATION_REQUIRED`; the caller pauses and links to verification rather than approving itself.

For review, inspect masked subject/document metadata and individual checks, request purpose-bound document delivery only when authorized, assign the task, record a stable reason code and safe explanation, then use an advertised action. A second principal completes maker-checker decisions. Never paste raw identity data into notes.

## Models

- `kycProfile`: scoped subject status and expiry.
- `kycVerificationCase`: idempotent attempt, policy/level/workflow/provider references and state.
- `kycDocumentRequirement`: configurable type, MIME, size, country, validity, and purpose policy.
- `kycDocument`: private `mediaCode`, masked metadata, retention/legal hold; no path/binary.
- `kycConsent`: immutable version, jurisdiction, source, and acceptance evidence.
- `kycCheck`: immutable step-level document, face, liveness, address, age, or future screening result.
- `kycDecision`: append-only decision chain; corrections reference a previous decision.
- `kycReviewTask`: queue, assignment, SLA, maker-checker, action, and escalation.
- `kycAuditEvent`: append-only subject hash, operation, permission, actor, correlation, outcome, and safe evidence.
- `kycProvider` / `kycProviderExecutionPolicy`: adapter readiness/execution policy; secret references only.

Axis uses backend schema metadata for fields, filters, pagination, references, and permissions. Inline safe evidence is bounded/read-only. Reference links use owning APIs; Axis never invents database relations or file URLs.

## Security

Every route is authenticated/access-group scoped and backend authorization additionally enforces tenant, enterprise, subject, operation, and record scope. Duties are separated for submitter, support metadata reader, reviewer, checker, policy administrator, provider operator, auditor, and purpose-bound document reader. UI hiding is not authorization.

Raw provider payloads, credentials, signing keys, private URLs, OCR, biometrics, full document numbers, and unnecessary PII are forbidden in responses, logs, fixtures, audit, Axis metadata, and errors. Webhooks require verified signatures, provider/tenant mapping, unique event IDs, timestamp tolerance, replay/idempotency checks, rate limits, and redacted failures. Every sensitive read/download is audited. Retention deletion honors legal hold and creates evidence.

## Providers

`kycProviderCore` requires `createCase`, `submitDocument`, `startCheck`, `getCaseStatus`, `handleWebhook`, `requestMoreInformation`, `cancelCase`, and `reconcileCase`. Results are allowlisted to safe provider references, status, decision, reason, message, and event time.

`mockKycProvider` is deterministic and non-production. It covers approval, rejection, review, pending, timeout, malformed response, unsigned callback, and replay. No real provider is production-ready in this slice. A real adapter needs guarded sandbox/live evidence for authentication/signing, API version, topology, capacity, timeout/retry/idempotency, callbacks, reconciliation, cleanup, redaction, and outage recovery before enabling `productionReady` and live calls.

Bulk import is not applicable to provider execution: regulated verification is an intent/Workflow operation. Governed exports may later expose redacted operational evidence through nExport; raw documents and payloads remain prohibited.

## Configuration and customization

Defaults live under `kyc.policy`, `kyc.documents`, `kyc.providerExecution`, `kyc.workflows`, `kyc.rateLimit`, and `kyc.safeErrors`. Projects own reusable policy, environments genuine deployment differences, servers process/provider composition, and nodes instance identity. Tenant/customer governance may narrow policy. Never copy an inherited block to change one value.

Smallest override:

```js
module.exports = { kyc: { policy: { expiryDays: 180 } } };
```

Smallest adapter registration:

```js
module.exports = { kyc: { providers: { adapters: {
    customerIdentity: 'CustomerIdentityKycProviderAdapterService'
} } } };
```

Add checks through a verification level plus later Pipeline/Workflow composition. Override named validation/policy services while retaining scope, consent, private-media, immutability, audit, and safe-evidence invariants. Axis may add a project renderer around backend metadata; it must not copy policy, lifecycle, provider selection, or authorization.

Never fork KYC Core, add another registry/state machine, expose generated sensitive mutation, call providers from Profile/Payment/Axis, upload outside nMedia, edit Workflow state directly, or make evidence mutable. Rollback removes the later-layer contribution and restores prior effective configuration; historic evidence remains immutable.

## Operations, scale, failure and recovery

Measure scoped case volume/status/entry point, pass/reject/review/abandonment, provider latency/errors, callback signature/replay/idempotency failures, review SLA/queue depth, document rejection, reuse, retention backlog/legal holds, and cost estimates. Never use raw identifiers as metric labels.

Idempotency and unique indexes prevent duplicate cases/callbacks. Axis queues paginate over scoped indexes. Provider retries/failover obey policy; uncertain non-idempotent outcomes reconcile first. Outage routes work to pending/manual review, never auto-approval. Invalid callbacks are rejected/audited. Retention failures alert and retry without deleting legal holds.

Backup/restore preserves KYC records, nMedia references, Workflow carriers, secret references, and audit ordering together. Restored provider sessions require reconciliation. Legacy email/mobile verification remains a compatibility entry backed by Notify; regulated document cases use the intent contract.

## Verification

`kycComplianceCapabilityContract.test.js` proves privacy/scope/immutability, configuration, exact thresholds, reuse/masking, lifecycle rejection, maker-checker, nMedia boundaries, provider redaction, Pipeline/Workflow placement, secure intent routes, mock conformance, timeout/malformed results, and callback security. `kycNotifyVerificationContract.test.js` protects centralized email/mobile verification. Run focused tests, structure audit, generated-context generation/validation, integration/import checks, Axis verification, and release regression.
