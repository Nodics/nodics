/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Licensed under the root license. */
const assert = require('assert');
const path = require('path');

global.ENUMS = { WorkflowActionType: { AUTO: { key: 'AUTO' }, MANUAL: { key: 'MANUAL' } }, WorkflowActionPosition: { HEAD: { key: 'HEAD' } } };

const core = path.resolve(__dirname, '..');
const schema = require(path.resolve(core, '../kycSchema/src/schemas/schemas'));
const config = require(path.resolve(core, 'config/properties'));
const policy = require(path.resolve(core, 'src/service/defaultKycPolicyService'));
const lifecycle = require(path.resolve(core, 'src/service/defaultKycLifecycleService'));
const fs = require('fs');
const registry = require(path.resolve(core, '../kycProviders/kycProviderCore/src/service/defaultKycProviderRegistryService'));
const mock = require(path.resolve(core, '../kycProviders/mockKycProvider/src/service/defaultMockKycProviderAdapterService'));
const pipelines = require(path.resolve(core, 'src/pipelines/pipelines'));
const routes = require(path.resolve(core, '../kycApi/src/router/routers'));
const workflowHeads = require(path.resolve(core, 'data/init/data/mobile/mobileNumberKycWorkflowHeadData'));
const workflowActions = require(path.resolve(core, 'data/init/data/mobile/mobileNumberKycWorkflowActionData'));

describe('KYC compliance capability contract', function () {
    it('keeps sensitive schemas private and scoped', function () {
        const models = schema.kycSchema;
        ['kycProfile', 'kycVerificationCase', 'kycDocumentRequirement', 'kycDocument', 'kycConsent', 'kycCheck', 'kycDecision', 'kycReviewTask', 'kycAuditEvent', 'kycProvider', 'kycProviderExecutionPolicy'].forEach(name => {
            assert.strictEqual(models[name].router.enabled, false, `${name} must not expose generated CRUD`);
            assert.strictEqual(models[name].definition.tenantCode.required, true);
            assert.strictEqual(models[name].definition.enterpriseCode.required, true);
        });
        ['kycConsent', 'kycCheck', 'kycDecision', 'kycAuditEvent'].forEach(name => assert.strictEqual(models[name].immutable, true));
        assert.ok(models.kycDocument.definition.mediaCode);
        assert.ok(!models.kycDocument.definition.path && !models.kycDocument.definition.rawPayload);
    });

    it('publishes configuration-first policy and role-scoped Axis navigation', function () {
        assert.deepStrictEqual(config.kyc.policy.supportedSubjectTypes, ['CUSTOMER', 'EMPLOYEE']);
        assert.strictEqual(config.kyc.providerExecution.liveCallsEnabled, false);
        assert.strictEqual(config.kyc.documents.requirePrivateVisibility, true);
        const navigation = config.backofficeCapabilities.kyc.navigation;
        assert.ok(navigation.length >= 7);
        navigation.forEach(item => {
            assert.strictEqual(item.parentId, 'compliance-management');
            assert.strictEqual(item.parentModuleName, 'complianceCore');
            assert.ok(item.route.startsWith('/compliance-management/kyc/'));
            assert.strictEqual(item.group.id, 'compliance-management');
            assert.ok(item.requiredPermissions.length);
        });
    });

    it('resolves verification levels and reusable decisions without floating-point thresholds', function () {
        const request = { subjectType: 'CUSTOMER', entryPoint: 'CHECKOUT' };
        const resolved = policy.resolvePolicy(request, config.kyc);
        assert.strictEqual(resolved.verificationLevel, 'BASIC');
        assert.ok(resolved.requiredDocumentTypes.includes('NATIONAL_ID'));
        assert.strictEqual(typeof config.kyc.policy.highValueThresholds.checkoutMinorUnits, 'string');
        const eligible = policy.evaluateEligibility(request, { kycStatus: 'APPROVED', expiresAt: new Date(Date.now() + 60000) }, config.kyc);
        assert.strictEqual(eligible.eligible, true);
        assert.strictEqual(policy.maskDocumentNumber('123456789', 4), '*****6789');
    });

    it('enforces lifecycle transitions, maker-checker, media boundaries, and safe provider evidence', function () {
        assert.strictEqual(lifecycle.resolveAction('APPROVE', 'MANUAL_REVIEW_REQUIRED', {}).status, 'APPROVED');
        assert.throws(() => lifecycle.resolveAction('APPROVE', 'APPROVED', {}), error => error.code === 'KYC_STATE_CONFLICT');
        assert.throws(() => lifecycle.resolveAction('APPROVE', 'MANUAL_REVIEW_REQUIRED', { makerChecker: { required: true, makerReference: 'same', checkerReference: 'same' } }), error => error.code === 'KYC_MAKER_CHECKER_REQUIRED');
        assert.strictEqual(lifecycle.assertPrivateMediaReference({ mediaCode: 'media-1', visibility: 'PRIVATE' }), true);
        assert.throws(() => lifecycle.assertPrivateMediaReference({ mediaCode: 'media-1', visibility: 'PRIVATE', path: '/tmp/identity.png' }), error => error.code === 'KYC_EVIDENCE_REJECTED');
        assert.deepStrictEqual(lifecycle.normalizeProviderEvidence({ providerCode: 'mockKyc', status: 'COMPLETED', rawPayload: { pii: true }, credential: 'secret' }), { providerCode: 'mockKyc', status: 'COMPLETED' });
    });

    it('uses Pipeline for deterministic work and Workflow continuation for long-running review', function () {
        assert.deepStrictEqual(Object.keys(pipelines.submitKycCasePipeline.nodes), ['validateRequest', 'resolvePolicy', 'validateConsent', 'validateDocuments', 'buildEvidence', 'persistEvidence', 'startWorkflow']);
        assert.ok(pipelines.reviewKycCasePipeline.nodes.continueWorkflow);
        assert.ok(pipelines.handleKycProviderWebhookPipeline.nodes.validateEnvelope);
        assert.strictEqual(workflowHeads.record2.code, 'kycVerificationWorkflow');
        assert.strictEqual(workflowHeads.record3.code, 'kycManualReviewWorkflow');
        assert.strictEqual(workflowActions.record9.type, 'MANUAL');
    });

    it('exposes secure intent APIs only', function () {
        const intent = routes.kycApi.complianceKyc;
        Object.values(intent).forEach(route => { assert.strictEqual(route.secured, true); assert.ok(route.accessGroups.length); });
        assert.strictEqual(intent.submitCase.method, 'POST');
        assert.strictEqual(intent.performCaseAction.method, 'POST');
        assert.strictEqual(intent.performCaseAction.permission, 'kyc.review.action');
        const handlerSource = fs.readFileSync(path.resolve(core, 'src/service/defaultKycCasePipelineService.js'), 'utf8');
        assert.ok(handlerSource.includes('request.authData.permissions'));
        assert.ok(!handlerSource.includes('request.permissionVerified'));
        const controllerSource = fs.readFileSync(path.resolve(core, '../kycApi/src/controller/defaultKycController.js'), 'utf8');
        assert.ok(controllerSource.includes('authData,'));
        assert.ok(controllerSource.includes('tenantCode: tenant'));
    });

    it('conforms the deterministic mock provider and covers lifecycle edges', async function () {
        assert.strictEqual(registry.assertAdapter(mock), true);
        assert.strictEqual((await mock.createCase({ idempotencyKey: 'approve', scenario: 'APPROVE' })).decision, 'APPROVED');
        assert.strictEqual((await mock.createCase({ idempotencyKey: 'reject', scenario: 'REJECT' })).decision, 'REJECTED');
        assert.strictEqual((await mock.createCase({ idempotencyKey: 'review', scenario: 'REVIEW' })).decision, 'MANUAL_REVIEW_REQUIRED');
        await assert.rejects(mock.createCase({ scenario: 'TIMEOUT' }), error => error.code === 'KYC_PROVIDER_TIMEOUT');
        await assert.rejects(mock.createCase({ scenario: 'MALFORMED' }), error => error.code === 'KYC_PROVIDER_RESPONSE_INVALID');
    });

    it('rejects unsigned and replayed provider callbacks', function () {
        assert.throws(() => lifecycle.verifyWebhookEnvelope({ providerCode: 'mockKyc' }), error => error.code === 'KYC_WEBHOOK_REJECTED');
        assert.throws(() => lifecycle.verifyWebhookEnvelope({ signatureVerified: true, eventId: '1', providerCode: 'mockKyc', tenantCode: 't', enterpriseCode: 'e', eventTime: new Date().toISOString(), replayed: true }), error => error.code === 'KYC_WEBHOOK_REPLAYED');
    });
});
