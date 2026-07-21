/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module pricing/test/PricingPublicationWorkflowContract
 * @description Verifies manual and automatic Pricing workflow submission, idempotency, associated items, approval evidence, nPublish delegation, and runtime separation.
 * @layer test
 * @owner pricing
 * @override Not applicable; this test protects the OOTB publication lifecycle.
 */
global.ENUMS = { WorkflowActionType: { MANUAL: { key: 'MANUAL' }, AUTO: { key: 'AUTO' } }, WorkflowActionPosition: { HEAD: { key: 'HEAD' } } };
const assert = require('assert'), properties = require('../config/properties').pricing, routes = require('../src/router/routers').pricing.management;
const heads = require('../data/init/data/publication/defaultPricingPublicationWorkflowHeadData'), actions = require('../data/init/data/publication/defaultPricingPublicationWorkflowActionData'), channels = require('../data/init/data/publication/defaultPricingPublicationWorkflowChannelData');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'pricing' ? properties : undefined }; global.SERVICE = {};
SERVICE.DefaultPricingEnterpriseScopeService = require('../src/service/foundation/defaultPricingEnterpriseScopeService');
let initialized, published;
SERVICE.DefaultWorkflowCarrierService = { isCarrierAvailable: async request => request.carrierCode.endsWith('existing') };
SERVICE.DefaultWorkflowService = { initCarrier: async request => { initialized = request; return request.carrier; } };
SERVICE.DefaultPublicationLifecycleService = { publishApproved: async request => { published = request; return { code: request.publication.code, targetVersion: 'manifest-v2', state: 'ONLINE' }; } };
const service = require('../src/service/publication/defaultPricingPublicationWorkflowService'), authData = { tokenType: 'access', principalId: 'manager', enterprise: { code: 'e1' } };
const submission = approvalMode => ({ tenant: 't1', authData: authData, body: { submissionCode: approvalMode.toLowerCase(), approvalMode: approvalMode, priceListCode: 'retail', sourceVersion: 2, items: [{ schemaName: 'priceList', code: 'e1::priceList::retail', versionId: 2 }] } });
(async () => {
    assert.strictEqual(routes.submitPublication.permission, 'pricing.backoffice.manage'); assert.deepStrictEqual(routes.submitPublication.authTokenTypes, ['access']);
    assert.strictEqual(heads.manual.channels[0], 'pricingPublicationManualReviewChannel'); assert.strictEqual(heads.automatic.channels[0], 'pricingPublicationAutomaticPublishChannel');
    assert.strictEqual(actions.manualReview.type, 'MANUAL'); assert.strictEqual(actions.publish.handler, 'DefaultPricingPublicationWorkflowService.publish');
    assert.strictEqual(channels.approvedPublish.target, actions.publish.code); assert.strictEqual(channels.automaticPublish.target, actions.publish.code);
    let result = await service.submit(submission('MANUAL')); assert.strictEqual(result.workflowCode, properties.workflow.manualWorkflowCode); assert.strictEqual(initialized.releaseCarrier, true); assert.strictEqual(initialized.carrier.sourceDetail.publication.domain, 'pricing'); assert.strictEqual(initialized.carrier.sourceDetail.publication.rootCode, 'e1::priceList::retail'); assert.strictEqual(initialized.carrier.items[0].versionId, 2);
    result = await service.submit(submission('AUTOMATIC')); assert.strictEqual(result.workflowCode, properties.workflow.automaticWorkflowCode);
    result = await service.submit({ tenant: 't1', authData: authData, body: { submissionCode: 'existing', approvalMode: 'MANUAL', priceListCode: 'retail', sourceVersion: 2, items: [{ schemaName: 'priceList', code: 'e1::priceList::retail', versionId: 2 }] } }); assert.strictEqual(result.idempotent, true);
    await assert.rejects(service.submit({ authData: authData, body: { submissionCode: 'bad', approvalMode: 'MANUAL', priceListCode: 'retail', sourceVersion: -1, items: [] } }), error => error.code === 'ERR_PRICE_00026');
    await assert.rejects(service.submit({ authData: authData, body: { submissionCode: 'foreign', approvalMode: 'MANUAL', priceListCode: 'retail', sourceVersion: 2, items: [{ schemaName: 'cmsPage', code: 'page', versionId: 2 }] } }), error => error.code === 'ERR_PRICE_00026');
    let carrier = initialized.carrier, response = await service.publish({ tenant: 't1', authData: { tokenType: 'service' }, workflowCarrier: carrier }); assert.strictEqual(response.decision, 'SUCCESS'); assert.strictEqual(response.feedback.targetVersion, 'manifest-v2'); assert.strictEqual(published.publication.workflowRef, carrier.code); assert.strictEqual(published.publication.associatedItems[0].version, '2');
    await assert.rejects(service.publish({ workflowCarrier: { code: 'incomplete', items: [] } }), error => error.code === 'ERR_PRICE_00026');
    console.log('Pricing approval-to-nPublish workflow contract validated');
})().catch(error => { console.error(error); process.exit(1); });
