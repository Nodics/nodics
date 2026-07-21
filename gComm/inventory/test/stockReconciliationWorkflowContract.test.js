/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/test/stockReconciliationWorkflowContract @description Validates manual and automatic reconciliation action graphs, identity separation, and internal repair handoff. @layer test @owner inventory */
const assert = require('assert');
global.ENUMS = { WorkflowActionType: { MANUAL: { key: 'MANUAL' }, AUTO: { key: 'AUTO' } }, WorkflowActionPosition: { HEAD: { key: 'HEAD' } } };
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
const properties = require('../config/properties').inventory;
global.CONFIG = { get: key => key === 'inventory' ? properties : undefined };
const heads = require('../data/init/data/reconciliation/defaultStockReconciliationWorkflowHeadData'); const actions = require('../data/init/data/reconciliation/defaultStockReconciliationWorkflowActionData'); const channels = require('../data/init/data/reconciliation/defaultStockReconciliationWorkflowChannelData');
assert.strictEqual(heads.manual.type, 'AUTO'); assert.strictEqual(actions.manualReview.type, 'MANUAL'); assert.strictEqual(actions.manualComplete.type, 'AUTO'); assert.strictEqual(actions.automaticComplete.type, 'AUTO'); assert.strictEqual(channels.manualComplete.target, actions.manualComplete.code); assert.strictEqual(channels.automaticComplete.target, actions.automaticComplete.code);
let initialized; let approval; let repaired;
global.SERVICE = { DefaultWorkflowCarrierService: { isCarrierAvailable: async () => false }, DefaultWorkflowService: { initCarrier: async request => { initialized = request; } }, DefaultStockReconciliationService: { approve: async request => { approval = ['MANUAL', request]; }, approveAutomatic: async request => { approval = ['AUTOMATIC', request]; }, repair: async request => { repaired = ['DIRECT', request]; } }, DefaultStockReconciliationInternalClientService: { repair: async request => { repaired = ['INTERNAL', request]; } } };
const bridge = require('../src/service/reconciliation/defaultStockReconciliationWorkflowService');
const finding = { code: 'finding-1', findingCode: 'finding-1', enterpriseCode: 'e1', type: 'NEGATIVE_BALANCE', severity: 'CRITICAL', subjectCode: 'stock-1', repairable: true };
(async () => { await bridge.start(finding, { tenant: 't1', authData: { tokenType: 'service' } }); assert.strictEqual(initialized.workflowCode, 'stockReconciliationManualFlow'); assert.strictEqual(initialized.releaseCarrier, true); assert.strictEqual(initialized.carrier.sourceDetail.approvalMode, 'MANUAL');
    let carrier = initialized.carrier; await bridge.complete({ tenant: 't1', authData: { tokenType: 'access', principalId: 'operator-1' }, workflowCarrier: carrier }); assert.strictEqual(approval[0], 'MANUAL'); assert.strictEqual(repaired[0], 'INTERNAL');
    carrier = Object.assign({}, carrier, { code: 'automatic-carrier', sourceDetail: Object.assign({}, carrier.sourceDetail, { approvalMode: 'AUTOMATIC' }) }); await bridge.complete({ tenant: 't1', authData: { tokenType: 'service' }, workflowCarrier: carrier }); assert.strictEqual(approval[0], 'AUTOMATIC'); assert.strictEqual(repaired[0], 'DIRECT');
    await assert.rejects(bridge.complete({ tenant: 't1', authData: { tokenType: 'service' }, workflowCarrier: initialized.carrier }), error => error.code === 'ERR_INV_00051');
    let outbound; global.NODICS = { getInternalAuthToken: tenant => 'service-token-' + tenant }; SERVICE.DefaultModuleService = { buildRequest: options => options, fetch: async descriptor => { outbound = descriptor; return { result: true }; } }; let client = require('../src/service/reconciliation/defaultStockReconciliationInternalClientService'); await client.repair({ tenant: 't1', reconciliation: { code: 'finding-1', workflowCarrierCode: 'carrier-1' } }); assert.strictEqual(outbound.methodName, 'POST'); assert.strictEqual(outbound.header.Authorization, 'Bearer service-token-t1'); assert.strictEqual(outbound.requestBody.code, 'finding-1'); assert.strictEqual(outbound.idempotencyKey, 'carrier-1');
    console.log('Inventory Stock Reconciliation workflow contract validated'); })().catch(error => { console.error(error); process.exit(1); });
