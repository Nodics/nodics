/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/test/orderCancellationOwnerEvidenceContract @description Verifies live Inventory, Fulfillment, Payment, and Product cancellation evidence providers. @layer test @owner order */
const assert = require('assert');
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(first, second, third) { super(String(third ? first : second || first)); this.code = third || first; } } };
global.CONFIG = { get: key => key === 'units' ? { maximumScale: 18 } : undefined };
const inventory = require('../../../baseCommerce/inventory/src/service/allocation/defaultOrderCancellationInventoryEvidenceProviderService');
const fulfillment = require('../../../fulfillment/fulfillmentCore/src/service/release/defaultOrderCancellationFulfillmentEvidenceProviderService');
const payment = require('../../../payment/paymentCore/src/service/cancellation/defaultOrderCancellationPaymentEvidenceProviderService');
const product = require('../../../baseCommerce/product/src/service/reference/defaultOrderCancellationProductEvidenceProviderService');
const context = { tenant: 'tenant-1', authData: { tokenType: 'service', principalId: 'workflow' }, entCode: 'enterprise-1', orderCode: 'order-1', items: [{ orderEntryCode: 'entry-1', unitCode: 'EA', immutableEvidence: { catalogCode: 'catalog-1', itemType: 'SKU', itemCode: 'sku-1' } }] };
global.SERVICE = {
  DefaultExactUnitsService: require('../../../../gCore/units/src/service/exact/defaultExactUnitsService'),
  DefaultStockAllocationService: { get: async () => ({ result: [{ code: 'allocation-1', demandCode: 'order-1', demandLineCode: 'entry-1', allocatedQuantity: '3', fulfilledQuantity: '1', cancelledQuantity: '0', unitCode: 'EA', scale: 0, assignments: [{ state: 'ACTIVE', serialNumbers: ['serial-1', 'serial-2'] }] }] }) },
  DefaultFulfillmentConsignmentService: { get: async () => ({ result: [{ consignmentCode: 'consignment-1', orderCode: 'order-1', status: 'RELEASED', allocationEvidence: [{ allocationCode: 'delivery-1', entryCode: 'entry-1', quantity: '3' }], cancelledAllocationEvidence: [{ allocationCode: 'delivery-1', quantity: '1' }] }] }) },
  DefaultPaymentTransactionService: { get: async () => ({ result: [{ enterpriseCode: 'enterprise-1', orderCode: 'order-1', transactionCode: 'capture-1', paymentGroupCode: 'card', providerCode: 'provider-card', paymentModeCode: 'CARD', operation: 'CAPTURE', amount: '10.00', currencyCode: 'USD', status: 'CAPTURED' }] }) },
  DefaultProductEnterpriseScopeService: { error: (code, message) => { let error = new Error(message); error.code = code; return error; } },
  DefaultProductItemService: { get: async () => ({ result: [{ enterpriseCode: 'enterprise-1', catalogCode: 'catalog-1', itemType: 'SKU', itemCode: 'sku-1', status: 'ACTIVE', cancellationAllowed: true, cancellationPolicyCode: 'standard' }] }) },
};
(async () => {
  let inventoryEvidence = await inventory.resolve(context); assert.strictEqual(inventoryEvidence.items[0].releasableQuantity, '2'); assert.deepStrictEqual(inventoryEvidence.items[0].cancellationAllocations[0].serialNumbers, ['serial-1', 'serial-2']);
  let fulfillmentEvidence = await fulfillment.resolve(context); assert.strictEqual(fulfillmentEvidence.items[0].cancellableQuantity, '2'); assert.strictEqual(fulfillmentEvidence.items[0].state, 'RELEASED');
  let paymentEvidence = await payment.resolve(context); assert.strictEqual(paymentEvidence.items[0].state, 'CAPTURED'); assert.strictEqual(paymentEvidence.items[0].transactions[0].providerCode, 'provider-card');
  let productEvidence = await product.resolve(context); assert.strictEqual(productEvidence.items[0].cancellationAllowed, true); assert.strictEqual(productEvidence.items[0].policyCode, 'standard');
  let shippedService = SERVICE.DefaultFulfillmentConsignmentService; SERVICE.DefaultFulfillmentConsignmentService = { get: async () => ({ result: [{ consignmentCode: 'consignment-1', shipmentCode: 'shipment-1', status: 'SHIPPED', allocationEvidence: [{ allocationCode: 'delivery-1', entryCode: 'entry-1', quantity: '3' }] }] }) }; let shipped = await fulfillment.resolve(context); assert.strictEqual(shipped.items[0].cancellableQuantity, '0'); assert.strictEqual(shipped.items[0].state, 'SHIPPED'); SERVICE.DefaultFulfillmentConsignmentService = shippedService;
  console.log('Order cancellation owner evidence providers validated');
})().catch(error => { console.error(error); process.exit(1); });
