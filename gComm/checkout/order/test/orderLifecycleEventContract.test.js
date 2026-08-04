/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/test/orderLifecycleEventContract @description Protects normalized secret-free lifecycle event contracts emitted after durable audit. @layer test @owner order */
const assert = require('assert'); const properties=require('../config/properties'); global.CONFIG={get:key=>key==='order'?properties.order:undefined}; let captured;
global.SERVICE = { DefaultEventService: { handleEvent: async request => { captured = request.event; return true; } } };
const service = require('../src/service/lifecycle/defaultOrderLifecycleEventService');
(async () => { let result = await service.publish({ tenant: 'default' }, { requestCode: 'refund-1', requestType: 'REFUND', version: 2, orderCode: 'order-1', entCode: 'ent-1', customerCode: 'customer-1', state: 'COMPLETED', reasonCode: 'GOODWILL', workflowCarrierCode: 'carrier-1', evidence:{paymentExecution:{transactions:[{transactionCode:'refund-tx-1',providerTransactionRef:'provider-ref-1',providerPayload:{secret:true}}]},fulfillmentReturns:[{returnCode:'rma-1'}]} }, 'REFUND_EXECUTED', { historyCode: 'history-1' }); assert.strictEqual(result.published, true); assert.strictEqual(captured.event, 'orderLifecycle.refund_executed'); assert.strictEqual(captured.data.correlationId, 'carrier-1'); assert.strictEqual(captured.data.requestVersion, 2); assert.deepStrictEqual(captured.data.correlations.transactionCode,['refund-tx-1']); assert.deepStrictEqual(captured.data.correlations.returnCode,['rma-1']); assert.strictEqual(captured.data.notificationIntent.templateCode,'ORDER_REFUND_EXECUTED'); assert.deepStrictEqual(captured.data.notificationIntent.audiences,['CUSTOMER','SUPPORT','FINANCE']); assert.strictEqual(JSON.stringify(captured).includes('providerPayload'), false); console.log('Order lifecycle event contract validated'); })().catch(error => { console.error(error); process.exit(1); });
