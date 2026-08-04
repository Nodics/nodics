/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const test = require('node:test');

const properties = require('../config/properties').kyc;
const casePipeline = require('../src/service/defaultKycCasePipelineService');
const policy = require('../src/service/defaultKycPolicyService');
const review = require('../src/service/defaultKycReviewLifecycleService');
const eligibility = require('../src/service/defaultKycEligibilityService');
const providerExecution = require('../../kycProviders/kycProviderCore/src/service/defaultKycProviderExecutionService');
const providerRegistry = require('../../kycProviders/kycProviderCore/src/service/defaultKycProviderRegistryService');
const mockProvider = require('../../kycProviders/mockKycProvider/src/service/defaultMockKycProviderAdapterService');

const invoke = (method, request, response = { success: {} }) => new Promise((resolve, reject) => method(request, response, { nextSuccess: () => resolve(response), error: (req, res, error) => reject(error) }));
const list = (values, query) => values.filter(value => Object.entries(query || {}).every(([key, expected]) => value[key] === expected));

test('persists and completes the Axis-to-backend KYC journey through owner services', async t => {
  const original = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  t.after(() => { global.CONFIG = original.CONFIG; global.SERVICE = original.SERVICE; });
  const db = { cases: [], profiles: [], consents: [], documents: [], audits: [], attempts: [], decisions: [], reviews: [], notifications: [], events: [] };
  const repository = collection => ({
    get: async input => ({ result: list(db[collection], input.query) }),
    save: async input => { db[collection].push(input.model); return { result: input.model }; },
    update: async input => { const item = list(db[collection], input.query)[0]; if (!item) return { modifiedCount: 0 }; Object.assign(item, input.model.$set); return { modifiedCount: 1 }; },
  });
  global.CONFIG = { get: key => key === 'kyc' ? properties : key === 'kyc.persistence' ? properties.persistence : key === 'kyc.providerExecution' ? Object.assign({}, properties.providerExecution, { maxAttempts: 1, backoffMs: 0 }) : {} };
  const workflow = [];
  global.SERVICE = {
    DefaultKycPolicyService: policy,
    DefaultKycLifecycleService: { assertPrivateMediaReference: document => { if (!document.mediaCode || document.storagePurpose !== 'kycDocuments' || document.visibility !== 'PRIVATE') throw Object.assign(new Error('Invalid private media'), { code: 'KYC_EVIDENCE_REJECTED' }); } },
    DefaultKycMediaEvidenceService: { validate: async (request, document) => ({ mediaCode: document.mediaCode, purpose: document.storagePurpose, visibility: document.visibility }) },
    DefaultDatabaseTransactionService: { execute: async (scope, work) => { assert.strictEqual(scope.tenant, 'tenant-a'); return work({ transactionId: 'tx-kyc-1' }); } },
    DefaultKycVerificationCaseService: repository('cases'), DefaultKycProfileService: repository('profiles'), DefaultKycConsentService: repository('consents'), DefaultKycDocumentService: repository('documents'), DefaultKycAuditEventService: repository('audits'),
    DefaultKycLifecycleGovernanceService: { bindDocuments: async () => true },
    DefaultWorkflowService: { initCarrierItem: async input => { workflow.push(input); return { carrierCode: input.code }; } },
  };
  const request = { tenant: 'tenant-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', subjectType: 'CUSTOMER', subjectCode: 'customer-1', entryPoint: 'ONBOARDING', idempotencyKey: 'idem-1', correlationId: 'corr-1', authData: { principalId: 'customer-1', enterpriseCode: 'enterprise-a' }, consent: { consentVersion: '1.0', acceptedAt: new Date(), jurisdiction: 'AE' }, documents: [{ documentType: 'NATIONAL_ID', mediaCode: 'media-private-1', storagePurpose: 'kycDocuments', visibility: 'PRIVATE', documentNumber: '784-1234-5678901-2' }] };
  for (const method of ['validateSubmitRequest', 'resolvePolicy', 'validateConsent', 'validateDocuments', 'buildCaseEvidence', 'persistCaseEvidence', 'startVerificationWorkflow']) await invoke(casePipeline[method].bind(casePipeline), request);
  assert.strictEqual(db.cases.length, 1); assert.strictEqual(db.profiles.length, 1); assert.strictEqual(db.documents[0].maskedDocumentNumber.endsWith('01-2'), true); assert.strictEqual(workflow.length, 1);
  const duplicate = Object.assign({}, request); for (const method of ['validateSubmitRequest', 'resolvePolicy', 'validateConsent', 'validateDocuments', 'buildCaseEvidence', 'persistCaseEvidence']) await invoke(casePipeline[method].bind(casePipeline), duplicate); assert.strictEqual(duplicate.idempotent, true); assert.strictEqual(db.cases.length, 1);

  const provider = { providerCode: 'mockKyc', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', status: 'ACTIVE', healthStatus: 'READY', sandboxSupported: true, adapterService: 'DefaultMockKycProviderAdapterService' };
  const providerPolicy = { providerPolicyCode: 'policy-1', providerCode: 'mockKyc', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', status: 'ACTIVE', timeoutMs: 100, maxAttempts: 1, retryableErrorCodes: ['KYC_PROVIDER_TIMEOUT'], version: 1 };
  const account = { providerAccountCode: 'account-1', providerCode: 'mockKyc', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', status: 'ACTIVE', environment: 'sandbox' };
  Object.assign(global.SERVICE, {
    DefaultKycProviderExecutionService: providerExecution, DefaultKycProviderRegistryService: providerRegistry, DefaultMockKycProviderAdapterService: mockProvider,
    DefaultKycProviderService: { get: async input => ({ result: list([provider], input.query) }) }, DefaultKycProviderExecutionPolicyService: { get: async input => ({ result: list([providerPolicy], input.query) }), update: async () => ({ modifiedCount: 1 }) }, DefaultKycProviderAccountService: { get: async input => ({ result: list([account], input.query) }) }, DefaultKycProviderExecutionAttemptService: repository('attempts'), DefaultKycRateLimitService: { enforce: async () => true }, DefaultKycAuditService: { record: async (req, model) => db.audits.push(model) },
  });
  const providerResult = await providerExecution.execute({ tenant: 'tenant-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', caseCode: db.cases[0].caseCode, idempotencyKey: 'provider-1', executionMode: 'SANDBOX', scenario: 'APPROVE', authData: {} }, 'createCase');
  assert.strictEqual(providerResult.decision, 'APPROVED'); assert.strictEqual(db.attempts[0].status, 'SUCCEEDED'); assert.strictEqual(providerResult.rawPayload, undefined);

  const task = { reviewTaskCode: 'review-1', caseCode: db.cases[0].caseCode, tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', status: 'CLAIMED', makerCheckerRequired: true, safeNotes: [], version: 1 };
  db.reviews.push(task); Object.assign(global.SERVICE, { DefaultKycReviewTaskService: repository('reviews'), DefaultWorkflowService: { delegateAction: async () => true, takeoverAction: async () => true }, DefaultKycService: { performCaseAction: async action => { const decision = { decisionCode: 'decision-1', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', decision: action.action === 'REJECT' ? 'REJECTED' : 'APPROVED' }; db.decisions.push(decision); Object.assign(db.profiles[0], { kycStatus: decision.decision, latestDecisionCode: decision.decisionCode, expiresAt: new Date(Date.now() + 86400000), version: 2 }); db.notifications.push({ scenarioCode: 'KYC_DECIDED', caseCode: action.caseCode }); db.events.push({ eventType: 'KYC_DECIDED', caseCode: action.caseCode }); return decision; } } });
  const permissions = Object.values(properties.workflows.reviewActionPermissions);
  await review.mutate({ tenant: 'tenant-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', reviewTaskCode: 'review-1', action: 'REQUEST_CHECKER', requestedAction: 'APPROVE', reasonCode: 'VERIFIED', authData: { principalId: 'maker-1', permissions } });
  await assert.rejects(() => review.mutate({ tenant: 'tenant-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', reviewTaskCode: 'review-1', action: 'APPROVE', reasonCode: 'VERIFIED', authData: { principalId: 'maker-1', permissions } }), error => error.code === 'KYC_MAKER_CHECKER_REQUIRED');
  await review.mutate({ tenant: 'tenant-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', reviewTaskCode: 'review-1', action: 'APPROVE', reasonCode: 'VERIFIED', authData: { principalId: 'checker-1', permissions } });
  assert.deepStrictEqual([db.notifications.length, db.events.length], [1, 1]);

  Object.assign(global.SERVICE, { DefaultComplianceContextService: { resolve: (req, value) => ({ tenantCode: value.tenantCode, enterpriseCode: value.enterpriseCode, subjectType: value.subjectType, subjectCode: value.subjectCode }) }, DefaultKycDecisionService: repository('decisions') });
  const eligible = await eligibility.evaluate({ tenant: 'tenant-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', subjectType: 'CUSTOMER', subjectCode: 'customer-1', entryPoint: 'CHECKOUT', correlationId: 'checkout-1', authData: {} });
  assert.strictEqual(eligible.eligible, true); assert.strictEqual(eligible.decision, 'APPROVED'); assert.strictEqual(eligible.cache.private, true);
  await assert.rejects(() => eligibility.evaluate({ tenant: 'tenant-a', tenantCode: 'tenant-a', enterpriseCode: 'enterprise-a', subjectType: 'CUSTOMER', subjectCode: 'customer-1', entryPoint: 'CHECKOUT', kycProfile: db.profiles[0], authData: {} }), error => error.code === 'KYC_EVIDENCE_REJECTED');
  const isolated = await eligibility.evaluate({ tenant: 'tenant-b', tenantCode: 'tenant-b', enterpriseCode: 'enterprise-b', subjectType: 'CUSTOMER', subjectCode: 'customer-1', entryPoint: 'CHECKOUT', authData: {} });
  assert.strictEqual(isolated.eligible, false); assert.ok(db.audits.some(value => value.operation === 'SUBMITTED')); assert.ok(db.audits.some(value => value.operation === 'PROVIDER_EXECUTED')); assert.ok(db.audits.some(value => value.operation === 'REVIEW_ACTIONED')); assert.ok(db.audits.some(value => value.operation === 'ELIGIBILITY_EVALUATED'));
});
