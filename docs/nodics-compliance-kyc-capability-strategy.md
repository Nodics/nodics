# Nodics Compliance and KYC Capability Strategy

Status: planning document  
Purpose: capture the full long-term KYC, KYB, AML, sanctions, risk, consent, and compliance-module strategy before implementation.  
Scope: backend framework modules, provider architecture, Axis workspaces, security governance, and future implementation phases.

This document is intentionally broader than the first implementation slice. It should help future developers, architects, product owners, and AI tools understand what must exist eventually, what should be implemented first, and which module owns each responsibility.

## 1. Why KYC should be a separate capability

KYC is not only a customer-profile feature and not only a payment feature. It is a regulated business capability that can affect:

- customer onboarding;
- employee, seller, vendor, and partner onboarding;
- enterprise/business verification;
- wallet, payment, refund, withdrawal, and cash-on-delivery eligibility;
- restricted product purchase;
- high-value order placement;
- telecom SIM/eSIM activation;
- marketplace seller onboarding;
- age and eligibility checks;
- fraud, AML, sanctions, and politically exposed person screening;
- manual compliance review;
- audit, retention, and evidence governance.

Because it cuts across Profile, Media, Workflow, Payment, Checkout, Order, Storefront, BackOffice, and Axis, KYC must not be owned by any one of those modules.

KYC belongs under a dedicated top-level compliance family.

## 2. Proposed module hierarchy

Long-term target:

```text
gCompliance/
  complianceCore/

  kyc/
    kycCore/
    kycProviders/
      kycProviderCore/
      mockKycProvider/
      sumsubProvider/              future
      onfidoProvider/              future
      stripeIdentityProvider/      future
      personaProvider/             future
      truliooProvider/             future

  aml/                             future
    amlCore/
    amlProviders/
      amlProviderCore/
      mockAmlProvider/
      transactionMonitoringProvider/ future

  sanctions/                       future
    sanctionsCore/
    sanctionsProviders/
      sanctionsProviderCore/
      mockSanctionsProvider/
      ofacProvider/                future
      unProvider/                  future
      euProvider/                  future

  risk/                            future
    riskCore/
    riskProviders/
      riskProviderCore/
      mockRiskProvider/

  consent/                         future
    consentCore/

  documentVerification/            future
    documentVerificationCore/
    documentVerificationProviders/
      documentVerificationProviderCore/
      mockDocumentVerificationProvider/
```

Recommended first implementation slice:

```text
gCompliance/
  complianceCore/

  kyc/
    kycCore/
    kycProviders/
      kycProviderCore/
      mockKycProvider/
```

## 3. Module ownership

### gCompliance

Top-level compliance family group.

Responsibilities:

- composition only;
- shared compliance documentation;
- family-level AI/agent guidance;
- no schemas, services, routers, controllers, or business logic directly in the group.

### complianceCore

Shared compliance foundations that are not specific to KYC, AML, sanctions, or consent.

Possible responsibilities:

- compliance subject resolution;
- compliance policy evaluation helpers;
- shared compliance audit event model;
- shared compliance decision terminology;
- shared retention and masking policy helpers;
- shared compliance operation authorization helpers;
- common compliance status definitions;
- shared BackOffice/Axis compliance capability metadata.

Example subject types:

```text
CUSTOMER
EMPLOYEE
ENTERPRISE
SELLER
VENDOR
PARTNER
DELIVERY_PARTNER
PAYMENT_ACCOUNT
WALLET_ACCOUNT
ORDER
PAYMENT_TRANSACTION
```

### kyc

KYC family group.

Responsibilities:

- composition only;
- groups KYC core and provider-family modules;
- no direct KYC case lifecycle or provider adapter logic.

### kycCore

Primary KYC/KYB authority.

Responsibilities:

- KYC/KYB case lifecycle;
- verification requirements;
- document requirements;
- document evidence references;
- consent evidence;
- provider submission orchestration;
- manual review workflow;
- decisions and override evidence;
- case expiration and re-verification;
- risk level and eligibility outcomes;
- audit, masking, retention, and compliance events;
- Axis KYC workspace metadata;
- secure intent routes and workflow/pipeline orchestration.

KYC Core must not store raw document files, raw provider payloads, credentials, or secrets.

### kycProviders

KYC provider-family group.

Responsibilities:

- composition only;
- groups provider core and individual provider adapters;
- no direct provider execution logic.

### kycProviderCore

Shared KYC provider runtime contract.

Responsibilities:

- provider adapter contract;
- safe evidence normalization;
- webhook verification contract;
- retry, timeout, failover, and live-call gating policy;
- provider conformance tests;
- provider status and readiness checks;
- redaction and safe payload rules.

### mockKycProvider

Default deterministic provider for local development and tests.

Responsibilities:

- no live external calls;
- deterministic approval/rejection/pending scenarios;
- safe provider-reference generation;
- contract-test evidence;
- beginner examples.

### Future provider modules

Examples:

- `sumsubProvider`;
- `onfidoProvider`;
- `stripeIdentityProvider`;
- `personaProvider`;
- `truliooProvider`.

Responsibilities:

- protocol translation only;
- no payment, profile, order, or KYC lifecycle ownership;
- no raw credential storage;
- no direct Axis lifecycle operations;
- all operations must go through KYC Core and provider-core governance.

## 4. Required use cases

### 4.0 Provider reference findings to strengthen Nodics design

This section captures product patterns observed from mature KYC/identity providers. These are not implementation instructions for copying any provider. They are reference signals for what an enterprise KYC capability should be able to model.

Reference providers reviewed:

- Sumsub: KYC, KYB, AML, transaction monitoring, Travel Rule, reusable KYC, case management, device intelligence, verification levels, applicant statuses, webhooks, review results, and dashboard operations.
- Persona: identity inquiries, verification objects, government ID, liveness, database checks, phone/email checks, digital ID, workflows, case management, graph, dynamic flow, and KYB onboarding.
- Stripe Identity: verification sessions, document checks, selfie checks, ID number, address, phone checks, client reference IDs, programmatic result access, and PII redaction.
- Entrust Identity Verification / Onfido: document reports, biometric/facial checks, watchlist reports, AML/sanctions/PEP/adverse-media screening, ongoing monitoring, repeat-attempt detection, country database checks, workflow studio, and biometric consent requirements.

Provider-informed capabilities Nodics should support:

- Dynamic verification flow:
  - support multiple KYC levels or templates by tenant, enterprise, country, channel, product, risk score, and subject type;
  - start with a low-friction check and escalate to stronger checks when policy or provider result requires it;
  - allow document, selfie, liveness, ID number, address, phone, database, watchlist, questionnaire, and payment-method checks to be combined.

- Case/inquiry lifecycle:
  - create one internal `kycVerificationCase` per governed verification attempt;
  - map provider concepts such as applicant, inquiry, verification session, report, check, and case into Nodics-safe models;
  - support `approved`, `rejected`, `needs review`, `pending`, `expired`, `abandoned`, `resubmission required`, and `manual review` states;
  - keep provider IDs only as safe references, never as lifecycle authority.

- Step-level verification results:
  - store each check as a separate `kycCheck` so a case can show document result, selfie result, liveness result, watchlist result, database result, phone result, address result, and provider-risk result independently;
  - allow a case to be approved even when some non-mandatory checks are skipped;
  - allow a case to require more information when one mandatory check fails or is inconclusive.

- Provider webhooks and asynchronous completion:
  - support provider callbacks for applicant reviewed, inquiry completed, verification updated, report completed, watchlist match changed, and provider-case status changed;
  - verify signatures, reject replayed events, map provider tenant/account, enforce idempotency, normalize evidence, and publish internal events;
  - allow webhook replay/resend diagnostics through governed operations.

- Manual review and case management:
  - compliance teams need a single case workspace with subject data, documents, checks, risk signals, workflow tasks, notes, assignments, SLA, decision history, and audit evidence;
  - cases may combine identity data, AML matches, payment methods, platform events, transactions, previous attempts, and suspicious patterns;
  - review tasks must support assign, reassign, approve, reject, request more information, escalate, override, and close.

- KYB and beneficial ownership:
  - business verification should include registry checks, business documents, ownership structure, beneficial owners, directors, authorized representatives, sanctions/AML checks, and manual review;
  - KYB should reuse KYC checks for beneficial owners but keep business verification lifecycle separate.

- Watchlist, AML, sanctions, PEP, and adverse media:
  - screening should be separately modeled from basic document verification;
  - a clear KYC result can still require AML review if watchlist or adverse media signals are raised;
  - ongoing monitoring must be able to create new alerts/cases after the original onboarding decision.

- Repeat attempt, device, behavior, and fraud signals:
  - detect repeated document use, repeated failed attempts, suspicious device behavior, mismatched submitted data, and risky transaction patterns;
  - store these as normalized risk signals rather than raw provider payloads.

- Consent and privacy:
  - explicit consent should be captured before biometric or sensitive document verification where required;
  - consent should record text/version, jurisdiction, timestamp, subject, channel, and provider requirement;
  - redaction, retention, deletion, legal hold, and data-access restrictions must be planned from the first implementation.

- Sandbox and deterministic testing:
  - provider-core must include deterministic mock responses for approval, rejection, needs-review, pending, webhook replay, provider timeout, malformed payload, and signature failure;
  - real provider modules should support sandbox/live separation and must never call live providers during normal unit tests.

- Reusable verification:
  - previous verified status may reduce friction for repeat checkout, account update, refund, wallet, payout, or seller onboarding;
  - reused KYC must respect expiry, scope, country, document type, risk, consent, and policy context.

- Operational analytics:
  - capture case volume, pass/fail/needs-review rates, provider latency, abandonment, document failure reasons, manual-review SLA, false-positive reviews, webhook failures, and cost indicators.

Provider-informed actions to add before implementation:

- Define provider-concept mapping for applicant, inquiry, verification session, verification, check, report, review result, webhook, case, and monitor.
- Define supported check types for the first slice and which future check types must be schema-compatible.
- Define verification-level/template policy so Nodics can model low-friction and step-up verification without hardcoding provider flows.
- Define manual-review workspace requirements before implementing only automated KYC.
- Define webhook event taxonomy and replay/idempotency behavior before adding provider adapters.
- Define redaction and retention behavior before storing any provider result or document reference.
- Define ongoing monitoring extension points even if AML/sanctions modules are delivered later.
- Define sandbox/mock evidence scenarios that mimic real provider lifecycle edges.

### 4.1 Customer onboarding KYC

A customer registers and must verify identity before account activation or before sensitive operations.

Typical steps:

1. Customer account is created by Profile.
2. KYC requirement is resolved by KYC policy.
3. Customer submits identity documents.
4. Documents are stored by nMedia as private media.
5. KYC Core creates a verification case.
6. Provider or manual review evaluates the case.
7. KYC decision is recorded.
8. Profile/customer eligibility is updated only through safe reference or event.

KYC owns verification state. Profile owns customer identity.

### 4.2 Checkout-triggered KYC

Checkout requires KYC for high-value, restricted, financial, regulated, or cross-border orders.

Examples:

- order total exceeds configured threshold;
- product category requires age/identity check;
- telecom SIM/eSIM purchase;
- gold/jewelry/high-value electronics purchase;
- wallet or prepaid balance used;
- cross-border shipping;
- customer risk score is high;
- payment method requires verification.

Checkout should ask KYC for eligibility. Checkout must not implement KYC logic.

### 4.3 Payment-triggered KYC

Payment may require KYC before:

- card authorization above threshold;
- wallet activation;
- wallet top-up;
- withdrawal;
- refund above threshold;
- payout to seller/vendor;
- cash-on-delivery eligibility;
- high-risk payment provider operation.

Payment should ask KYC/Compliance for a decision and preserve safe evidence references.

### 4.4 Refund, return, and cancellation KYC

KYC may be required before:

- refund to a different account;
- high-value refund;
- partial refund with suspicious activity;
- return of regulated product;
- refund after chargeback history;
- manual override by support.

Refund approval workflows can depend on KYC status, but Refund/Payment remains the payment lifecycle authority.

### 4.5 Seller, vendor, and partner onboarding

Marketplace sellers, suppliers, delivery partners, and business partners may need KYB.

Required checks may include:

- company registration;
- trade license;
- tax/VAT registration;
- authorized signatory;
- beneficial owners;
- bank account ownership;
- address proof;
- sanction/PEP screening;
- manual compliance approval.

### 4.6 Enterprise/business KYB

Enterprise onboarding may require business verification.

Use cases:

- enterprise tenant onboarding;
- B2B account activation;
- credit-limit approval;
- invoice payment eligibility;
- business contract activation;
- regulated B2B commerce.

Profile owns Enterprise and Tenant records. KYC/KYB owns verification evidence.

### 4.7 Age and eligibility verification

Useful for:

- telecom;
- tobacco/alcohol in supported jurisdictions;
- insurance;
- health products;
- finance;
- restricted services.

KYC should support policy-driven checks without hardcoding product types.

### 4.8 Periodic re-verification

KYC may expire or require refresh when:

- document expires;
- provider result expires;
- regulation changes;
- customer changes legal name/address;
- suspicious activity appears;
- business ownership changes.

This is a Workflow-driven process.

### 4.9 Manual review and escalation

Compliance users must be able to:

- review pending cases;
- request more documents;
- approve;
- reject;
- escalate;
- override with reason;
- assign to another reviewer;
- record evidence;
- trigger re-check;
- close case.

Manual review must be permissioned, audited, and maker-checker capable where needed.

### 4.10 AML and sanctions dependency

KYC may require AML/sanctions checks now or later.

Initial KYC should not hardcode AML, but should leave extension points for:

- sanctions screening;
- PEP screening;
- adverse media;
- transaction monitoring;
- suspicious activity flags.

## 5. Suggested schemas

Initial KYC Core schemas:

```text
kycProfile
kycVerificationCase
kycDocumentRequirement
kycDocument
kycConsent
kycCheck
kycDecision
kycReviewTask
kycAuditEvent
kycProvider
kycProviderExecutionPolicy
```

Future KYB schemas:

```text
kybBusinessProfile
kybBeneficialOwner
kybBusinessDocument
kybVerificationCase
kybDecision
```

Future AML/sanctions schemas:

```text
amlScreeningCase
amlScreeningResult
sanctionsScreeningCase
sanctionsMatch
riskSignal
riskScore
```

## 6. Schema design notes

### 6.1 kycProfile

Represents the compliance profile for a subject.

Important fields:

```text
code
subjectType
subjectCode
tenantCode
enterpriseCode
kycStatus
riskLevel
latestCaseCode
latestDecisionCode
verifiedAt
expiresAt
requiresReview
```

This should not duplicate Profile identity details beyond safe references.

### 6.2 kycVerificationCase

Represents one verification attempt or review cycle.

Important fields:

```text
code
kycProfileCode
subjectType
subjectCode
caseType
status
providerCode
providerCaseRef
requiredDocumentCodes
submittedDocumentCodes
checkCodes
decisionCode
workflowCode
currentReviewer
createdReason
expiresAt
```

### 6.3 kycDocumentRequirement

Defines required documents by policy.

Examples:

```text
PASSPORT
NATIONAL_ID
DRIVING_LICENSE
PROOF_OF_ADDRESS
SELFIE
LIVENESS_CAPTURE
TRADE_LICENSE
TAX_CERTIFICATE
BANK_ACCOUNT_PROOF
BOARD_RESOLUTION
```

### 6.4 kycDocument

Stores safe document metadata and references private nMedia assets.

Important fields:

```text
code
caseCode
documentType
mediaCode
status
maskedDocumentNumber
issuingCountry
expiryDate
providerDocumentRef
verificationResult
retentionUntil
```

Rules:

- no raw file path;
- no full document number unless encrypted/masked policy exists;
- no raw OCR payload unless governed and redacted;
- media must be private and purpose-bound.

### 6.5 kycCheck

Represents an individual check performed for a case.

Examples:

```text
DOCUMENT_AUTHENTICITY
FACE_MATCH
LIVENESS
ADDRESS_VERIFICATION
AGE_VERIFICATION
SANCTIONS_SCREENING
PEP_SCREENING
BUSINESS_REGISTRY
BANK_ACCOUNT_OWNERSHIP
```

### 6.6 kycDecision

Immutable decision evidence.

Decision examples:

```text
APPROVED
REJECTED
PENDING
EXPIRED
MANUAL_REVIEW_REQUIRED
MORE_INFORMATION_REQUIRED
ESCALATED
SUSPENDED
```

Decision records should be append-only or immutable after finalization. Corrections should create new evidence.

### 6.7 kycConsent

Captures user consent for KYC processing.

Important fields:

```text
subjectType
subjectCode
consentType
consentVersion
acceptedAt
revokedAt
source
ipHash
userAgentHash
```

### 6.8 kycProvider and kycProviderExecutionPolicy

Provider metadata and execution governance.

Must not store secrets. Secrets must be resolved from governed secret/config systems.

## 7. Workflow and pipeline design

### 7.1 Pipeline usage

Use nPipeline for deterministic single-task execution.

Example: submit KYC case pipeline

```text
validate request
resolve subject
resolve enterprise/tenant context
resolve policy requirements
validate consent
validate media/document references
create or update KYC profile
create verification case
create document evidence
call provider adapter if configured
persist safe provider evidence
return safe response
```

### 7.2 Workflow usage

Use Workflow for long-running business processes.

Example: KYC verification workflow

```text
case submitted
document completeness check
provider verification
sanctions/AML extension point
manual review if required
approval/rejection
notification/event publication
expiry/re-verification schedule
```

Manual review, escalation, provider callback, and delayed re-checks belong in Workflow, not a single service method.

## 8. Provider architecture

The provider architecture should follow the same pattern used for AI providers and payment providers.

```text
kycProviders/
  kycProviderCore/
  mockKycProvider/
  sumsubProvider/
  onfidoProvider/
  stripeIdentityProvider/
```

### 8.1 kycProviderCore adapter contract

Required operations:

```text
createCase
submitDocument
startCheck
getCaseStatus
handleWebhook
requestMoreInformation
cancelCase
reconcileCase
```

### 8.2 Provider safe evidence

Provider adapters must return safe normalized evidence:

```text
providerCode
providerCaseRef
providerDocumentRef
providerCheckRef
status
decision
reasonCode
safeMessage
eventTime
```

They must not return:

- raw identity document image;
- full OCR payload;
- provider secret;
- raw webhook payload;
- raw PII-heavy response;
- unredacted document number;
- full biometric data.

### 8.3 Webhook governance

Provider webhooks must be:

- authenticated;
- signature verified;
- idempotent;
- tenant/enterprise resolved safely;
- raw payload redacted or stored only in governed encrypted evidence if approved;
- mapped to normalized provider events;
- audited.

## 9. Media and document handling

KYC documents must use nMedia.

Rules:

- KYC stores `mediaCode`, not file path.
- Media visibility must be private.
- Direct browser access should require authenticated, purpose-bound delivery.
- Every document view/download must be audited.
- Retention policy must define document expiry/delete behavior.
- KYC must not bypass nMedia storage/lifecycle governance.

Example:

```text
kycDocument.mediaCode -> nMedia.media.code
```

## 10. Integration ownership

### Profile

Owns:

- customer;
- employee;
- user;
- tenant;
- enterprise;
- address;
- identity/account records.

Does not own:

- KYC verification state;
- provider verification evidence;
- manual compliance decisions.

### KYC

Owns:

- verification cases;
- document requirements;
- document evidence metadata;
- provider case references;
- compliance review status;
- decisions;
- audit events.

### Payment

May ask KYC for:

- payment eligibility;
- refund eligibility;
- wallet/withdrawal eligibility;
- provider operation eligibility.

Payment owns payment transaction lifecycle.

### Checkout and Order

May ask KYC for:

- restricted product eligibility;
- high-value order eligibility;
- regulatory purchase eligibility;
- cross-border/region-specific eligibility.

Checkout/Order owns cart/order lifecycle.

### Workflow

Owns long-running review, escalation, provider callback, and approval process execution.

### Axis

Owns presentation and business-user operations. Axis must not own KYC business logic.

## 11. Axis workspace requirements

Axis should expose a dedicated Compliance/KYC area.

Possible navigation:

```text
Compliance
  KYC Cases
  KYC Reviews
  KYC Profiles
  KYC Policies
  Document Requirements
  KYC Providers
  Provider Policies
  KYC Decisions
  KYC Audit

Future:
  AML Cases
  Sanctions Screening
  Risk Signals
  Consent Records
```

Axis pages should reuse existing backend-driven components:

- schema data table/list renderer;
- schema detail viewer;
- reference-link detail viewer;
- media preview component for private KYC documents;
- query builder;
- workflow action panel;
- provider configuration panel;
- audit timeline;
- info/documentation icon components;
- policy editor components where applicable.

Axis must provide:

- pending review queues;
- case detail;
- document preview with audited access;
- approve/reject/request-more-info actions;
- escalation;
- reviewer assignment;
- provider health/readiness;
- provider activation/suspension;
- policy configuration;
- audit trail.

## 12. Security and governance requirements

KYC is high-risk and must be treated as a sensitive capability.

Required rules:

- no anonymous KYC routes;
- no casual generated CRUD mutation for sensitive schemas;
- explicit intent APIs for submit/review/approve/reject/escalate;
- field-level masking;
- audit every sensitive read/write/download;
- permission separation between admin, reviewer, compliance manager, support, and auditor;
- maker-checker for overrides where required;
- immutable final decisions;
- append-only audit events;
- no raw document paths;
- no raw provider payloads in logs/config/test fixtures;
- encrypted or masked storage for sensitive fields if full value is required;
- retention and deletion policy;
- provider webhook signature verification;
- tenant and enterprise isolation;
- rate limiting and abuse protection;
- safe errors without leaking PII/provider details.

## 13. Configuration-first strategy

KYC behavior should be configurable through properties and governed runtime records.

Examples:

```text
kyc.policy.defaultCaseType
kyc.policy.requiredDocumentsBySubjectType
kyc.policy.requiredDocumentsByProductCategory
kyc.policy.highValueThresholds
kyc.policy.expiryDays
kyc.policy.manualReviewRules
kyc.policy.allowedProviders
kyc.policy.retention
kyc.policy.masking
kyc.providerExecution.timeoutMs
kyc.providerExecution.retryPolicy
kyc.providerExecution.liveCallsEnabled
```

Properties files must remain lightweight. Complex defaults should live in utils/services, not bulky business logic inside `config/properties.js`.

Customer modules should be able to customize:

- case types;
- subject types;
- document requirements;
- provider selection;
- review workflow;
- approval thresholds;
- retention;
- masking;
- Axis navigation/workspace metadata;
- validation services;
- provider adapters.

## 14. Suggested lifecycle statuses

KYC profile statuses:

```text
NOT_STARTED
PENDING
IN_REVIEW
APPROVED
REJECTED
EXPIRED
SUSPENDED
REVERIFICATION_REQUIRED
```

KYC case statuses:

```text
DRAFT
SUBMITTED
DOCUMENTS_REQUIRED
PROVIDER_PENDING
PROVIDER_COMPLETED
MANUAL_REVIEW_REQUIRED
APPROVED
REJECTED
ESCALATED
EXPIRED
CANCELLED
FAILED
```

Document statuses:

```text
REQUIRED
UPLOADED
VALIDATING
ACCEPTED
REJECTED
EXPIRED
REPLACED
DELETED_BY_RETENTION
```

Decision statuses:

```text
PENDING
APPROVED
REJECTED
OVERRIDDEN
REVOKED
EXPIRED
```

## 15. Implementation phases

### Phase 0 — Strategy and contracts

- Create this strategy document.
- Add TODO/backlog entry.
- Confirm module hierarchy.
- Confirm KYC versus KYB first-slice boundary.
- Confirm Axis workspace expectations.
- Confirm security model.
- Confirm provider-reference capability coverage: verification levels/templates, inquiries/cases, checks/reports, webhooks, watchlists, ongoing monitoring, consent, redaction, manual review, sandbox responses, and analytics.
- Add an architectural compliance review checklist before implementation starts.
- Add a security governance review checklist before implementation starts.
- Add a low-level beginner documentation checklist before implementation starts.

Architectural compliance review actions:

- Verify `gCompliance` is a top-level group and does not hide KYC inside Profile, Payment, Checkout, Order, or Axis.
- Verify group modules remain composition-only and do not contain schemas, routers, controllers, services, or business logic directly.
- Verify KYC Core owns KYC lifecycle state while Profile owns identity, nMedia owns files, Workflow owns long-running processes, and provider modules act only as adapters.
- Verify all implementation slices are modular, layered, configuration-first, and customer-extensible through customer modules.
- Verify deterministic single-operation work is modeled as Pipeline steps and long-running business review/provider processes are modeled as Workflow.
- Verify properties files contain only configuration and no service/business logic.
- Verify no duplicate implementation path is introduced where an existing framework capability already exists.
- Verify schemas, services, routers, pipelines, workflow actions, data, tests, AGENTS.md, README.md, and LLM context are placed in the owning module.
- Verify Axis surfaces are backend-driven and use reusable renderers for grids, details, references, actions, query building, media preview, info icons, and documentation icons.
- Verify canonical module documentation and framework documentation anchors are planned before declaring the capability business-ready.

Security governance review actions:

- Verify KYC routes are secure by default and no sensitive KYC operation is anonymous.
- Verify tenant, enterprise, subject, role, permission, and operation scope are enforced for every read, write, decision, workflow action, document access, and provider operation.
- Verify customer, support, compliance reviewer, approver, auditor, finance, and administrator duties are separated by policy.
- Verify maker-checker approval is available for override, rejection reversal, high-risk approval, and policy exception flows.
- Verify raw documents stay in nMedia as private media and KYC stores only governed media references and safe metadata.
- Verify raw provider payloads, credentials, secrets, verification keys, private document URLs, and unnecessary PII are never returned to Axis or persisted casually.
- Verify all provider callbacks/webhooks require signature verification, replay protection, tenant/provider mapping, idempotency, and safe error handling.
- Verify decision evidence, provider evidence, consent evidence, manual review evidence, and audit events are immutable or append-only.
- Verify masking, retention, deletion, legal hold, and audit-download policies are defined before real personal documents are processed.
- Verify all errors, logs, generated reports, and Axis metadata are redacted and safe for the caller's permission scope.

Low-level beginner documentation actions:

- Explain what KYC, KYB, AML, sanctions screening, risk scoring, consent, manual review, and provider verification mean in simple business language.
- Explain the difference between Profile identity and KYC verification with examples.
- Explain the difference between individual KYC and business KYB with examples.
- Explain a full customer onboarding KYC journey step by step.
- Explain a checkout-triggered KYC journey step by step.
- Explain a refund/payment-triggered KYC journey step by step.
- Explain every planned model, its purpose, key fields, relationships, owner module, lifecycle status, and example records.
- Explain how inline schemas and reference schemas should appear in Axis detail and listing views.
- Explain how nMedia is used for private document upload, preview, retention, and audit-safe delivery.
- Explain how KYC pipelines work and how a customer module can add, remove, or replace a pipeline step.
- Explain how KYC workflows work and how approval/escalation steps can be customized.
- Explain how KYC providers are added through adapter modules, including mock provider, sandbox provider, live provider, credentials, webhook, and evidence normalization.
- Explain how administrators configure document requirements, approval thresholds, provider policies, retention, masking, and role permissions from Axis.
- Explain what must never be customized by forking framework modules and what should be customized through layered modules/configuration/services.

### Phase 1 — Module skeleton

Create:

```text
gCompliance/
  complianceCore/
  kyc/
    kycCore/
    kycProviders/
      kycProviderCore/
      mockKycProvider/
```

Include:

- package metadata;
- AGENTS.md;
- README.md;
- lightweight config;
- LLM context entrypoints;
- module metadata tests;
- structure validation.

### Phase 2 — KYC core foundation

Implement:

- `kycProfile`;
- `kycVerificationCase`;
- `kycDocumentRequirement`;
- `kycDocument`;
- `kycDecision`;
- `kycAuditEvent`;
- policy service;
- safe lifecycle service;
- intent APIs;
- generated CRUD disabled for sensitive schemas where needed.

### Phase 3 — Media/document integration

Implement:

- document upload intent;
- nMedia reference validation;
- private media policy;
- document preview/download audit;
- retention metadata.

### Phase 4 — Workflow/pipeline

Implement:

- submit case pipeline;
- review case pipeline;
- provider submission pipeline;
- KYC verification workflow;
- manual review workflow actions;
- escalation and request-more-info.

### Phase 5 — Provider core and mock provider

Implement:

- provider adapter contract;
- safe evidence normalization;
- webhook contract;
- mock provider;
- provider conformance tests.

### Phase 6 — Axis workspace

Implement backend-driven Axis support for:

- KYC Cases;
- KYC Reviews;
- KYC Profiles;
- Document Requirements;
- KYC Providers;
- Provider Policies;
- KYC Audit;
- media preview integration;
- workflow action panel;
- policy screens.

### Phase 7 — Cross-module enforcement hooks

Integrate with:

- Profile onboarding;
- Checkout high-value/restricted order eligibility;
- Payment/refund/wallet eligibility;
- Order lifecycle;
- Storefront/customer app self-service.

### Phase 8 — KYB

Add:

- business profile;
- beneficial owners;
- business documents;
- enterprise verification;
- seller/vendor onboarding.

### Phase 9 — AML, sanctions, and risk

Add:

- AML module;
- sanctions module;
- risk signals;
- screening providers;
- transaction monitoring extension points.

### Phase 10 — Real provider adapters

Add provider modules incrementally:

- Sumsub;
- Onfido;
- Stripe Identity;
- Persona;
- Trulioo;
- customer-specific/government providers.

Each provider requires:

- mock/sandbox contract tests;
- redaction policy;
- webhook signature verification;
- timeout/retry/failover;
- live test guard;
- documentation.

## 16. Documentation requirements

KYC documentation must be beginner-friendly and should explain:

- what KYC is;
- why businesses need it;
- difference between KYC and KYB;
- difference between Profile identity and KYC verification;
- how documents are stored safely through nMedia;
- how provider adapters work;
- how manual review works;
- how Workflow and Pipeline are used;
- how KYC affects checkout/payment/refund;
- how to add a new document requirement;
- how to add a new KYC provider;
- how to customize KYC policy in customer modules;
- how to operate KYC in Axis;
- how to audit and troubleshoot cases;
- what must never be stored or logged.

## 17. Open questions

- Should first implementation include KYB or only individual KYC?
- Which subject types are required for the first slice: customer, employee, enterprise, seller, vendor, partner?
- Should KYC be required at onboarding first, checkout first, or both?
- Should document upload be available through Axis only, Storefront/customer app only, or both?
- Which provider should be modeled after the mock provider?
- Do we need AML/sanctions in the first production-ready slice or only extension points?
- What is the default document retention period?
- Which roles can view documents versus only view masked metadata?
- Should override decisions require maker-checker approval from day one?
- How should KYC status be exposed to Profile, Payment, Checkout, and Order: direct service call, event, cached policy decision, or all three?

## 18. Non-negotiable design principles

- KYC must be modular, layered, configuration-first, and customer-extensible.
- KYC must use Pipeline for deterministic single-task execution.
- KYC must use Workflow for long-running business review and provider processes.
- KYC must not be implemented inside Profile, Payment, Checkout, Order, or Axis.
- Axis is presentation and operation surface only.
- Raw document storage belongs to nMedia.
- Provider modules are adapters only.
- Final decisions and audit evidence must be immutable or append-only.
- Secrets and raw PII-heavy provider payloads must never be stored casually.
- All sensitive access must be permissioned, audited, tenant-aware, and enterprise-aware.
