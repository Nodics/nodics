/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module fulfillment/test/warehouseReturnOperationsContract @description Protects scoped warehouse receipt, inspection, and Inventory-owned disposition APIs. @layer test @owner fulfillment */
const assert = require('assert'); const properties = require('../config/properties'); global.CONFIG = { get: key => key === 'fulfillment' ? properties.fulfillment : undefined };
let record = { returnCode: 'return-1', entCode: 'ent-1', siteCode: 'site-1', status: 'APPROVED', receivedQuantity: '1' }; let pipelineRequest;
global.SERVICE = {
    DefaultReturnRequestService: { loadReturn: async () => record, receiveReturn: async request => { assert.strictEqual(request.authData.tokenType, 'service'); record = Object.assign({}, record, { status: 'RECEIVED', receivedQuantity: request.receivedQuantity }); return record; }, inspectReturn: async request => { record = Object.assign({}, record, { status: 'INSPECTED', inspectionResult: request.inspectionResult, dispositionCode: request.dispositionCode }); return record; } },
    DefaultPipelineService: { start: async (name, request) => { pipelineRequest = request; return { returnRequest: Object.assign({}, record, { status: 'CLOSED' }), inventoryDisposition: { status: 'INVENTORY_DISPOSITION_APPLIED', movements: [{ code: 'move-1' }] } }; } },
};
const service = require('../src/service/return/defaultWarehouseReturnOperationsService'); const access = body => ({ tenant: 'default', authData: { tokenType: 'access', principalId: 'warehouse-1', enterpriseCode: 'ent-1', siteCodes: ['site-1'] }, params: { returnCode: 'return-1' }, body: body || {} });
(async () => { let received = await service.receive(access({ receivedQuantity: '1' })); assert.strictEqual(received.status, 'RECEIVED'); let inspected = await service.inspect(access({ inspectionResult: 'SELLABLE', dispositionCode: 'RESTOCK' })); assert.strictEqual(inspected.status, 'INSPECTED'); let disposed = await service.disposition(access({ receivedQuantity: '1', inspectionResult: 'SELLABLE', dispositionCode: 'RESTOCK' })); assert.strictEqual(disposed.inventoryDisposition.movements[0].code, 'move-1'); assert.strictEqual(pipelineRequest.authData.tokenType, 'service'); let outside = access({ receivedQuantity: '1' }); outside.authData.enterpriseCode = 'ent-2'; await assert.rejects(() => service.receive(outside), /outside assigned enterprise/); let clientService = access({ receivedQuantity: '1' }); clientService.authData.tokenType = 'service'; await assert.rejects(() => service.receive(clientService), /employee access/); const routes = require('../src/router/routers').fulfillment.warehouseReturnOperations; assert.strictEqual(routes.receive.permission, 'fulfillment.return.warehouse.receive'); assert.strictEqual(routes.inspect.permission, 'fulfillment.return.warehouse.inspect'); assert.strictEqual(routes.disposition.permission, 'fulfillment.return.warehouse.disposition'); console.log('Fulfillment warehouse Return operations contract validated'); })().catch(error => { console.error(error); process.exit(1); });
