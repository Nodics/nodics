/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/test/orderCancellationEligibilityContract
 * @description Protects exact, deterministic, side-effect-free cancellation eligibility using normalized evidence from owning modules.
 * @layer test
 * @owner order
 * @override Project modules may replace policy or evidence providers while preserving owner boundaries, fail-closed evidence, and exact quantities.
 */
const assert = require('assert');

const properties = require('../config/properties');
global.CONFIG = {
    get: (key) => key === 'order' ? properties.order : key === 'units' ? { maximumScale: 18 } : undefined,
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(first, second, third) {
            super(String(third ? first : second || first));
            this.code = third || first;
        }
    },
};

const exact = require('../../../../gCore/units/src/service/exact/defaultExactUnitsService');
global.SERVICE = { DefaultExactUnitsService: exact };
const eligibility = require('../src/service/lifecycle/defaultOrderCancellationEligibilityService');
const pipelines = require('../src/pipelines/pipelines');
const config = properties.order.orderLifecycle.cancellationEligibility;
const now = '2026-08-03T10:00:00.000Z';

assert.strictEqual(config.pipelineName, 'orderCancellationEligibilityPipeline');
assert.strictEqual(config.evidenceProviders.inventory.ownerModule, 'inventory');
assert.strictEqual(config.evidenceProviders.fulfillment.ownerModule, 'fulfillment');
assert.strictEqual(config.evidenceProviders.payment.ownerModule, 'payment');
assert.strictEqual(config.evidenceProviders.product.ownerModule, 'product');
assert.strictEqual(pipelines.orderCancellationEligibilityPipeline.hardStop, true);
assert.strictEqual(pipelines.orderCancellationEligibilityPipeline.nodes.evaluateItems.handler, 'DefaultOrderCancellationEligibilityService.evaluateItems');

const clone = (value) => JSON.parse(JSON.stringify(value));
const base = {
    tenant: 'default',
    authData: { tokenType: 'access', principalId: 'employee-1' },
    now: now,
    cancellationEligibility: {
        entCode: 'enterprise-1',
        order: { code: 'order-1', status: 'PLACED', placedAt: '2026-08-03T09:00:00.000Z' },
        items: [{ orderEntryCode: 'entry-1', unitCode: 'EA', requestedQuantity: '1', orderedQuantity: '3', alreadyCancelledQuantity: '0' }],
        ownerEvidence: {
            inventory: { items: [{ orderEntryCode: 'entry-1', unitCode: 'EA', releasableQuantity: '3.00', allocationCodes: ['allocation-1'] }] },
            fulfillment: { items: [{ orderEntryCode: 'entry-1', unitCode: 'EA', cancellableQuantity: '2.00', state: 'RELEASED', fulfillmentCodes: ['release-1'] }] },
            payment: { items: [{ orderEntryCode: 'entry-1', state: 'AUTHORIZED', transactionCodes: ['payment-1'] }] },
            product: { items: [{ orderEntryCode: 'entry-1', cancellationAllowed: true, policyCode: 'standard-cancellation' }] },
        },
    },
};

(async () => {
    const decision = await eligibility.evaluate(clone(base));
    assert.strictEqual(decision.eligible, true);
    assert.strictEqual(decision.items[0].eligibleQuantity, '2.00');
    assert.strictEqual(decision.items[0].requiredActions.payment, 'VOID');
    assert.strictEqual(decision.items[0].requiredActions.inventory, 'RELEASE');
    assert.deepStrictEqual(decision.items[0].evidence.paymentTransactionCodes, ['payment-1']);

    const excessive = clone(base);
    excessive.cancellationEligibility.items[0].requestedQuantity = '3';
    const excessiveDecision = await eligibility.evaluate(excessive);
    assert.strictEqual(excessiveDecision.eligible, false);
    assert(excessiveDecision.items[0].reasons.includes('REQUESTED_QUANTITY_EXCEEDS_ELIGIBLE'));

    const shipped = clone(base);
    shipped.cancellationEligibility.ownerEvidence.fulfillment.items[0].state = 'SHIPPED';
    const shippedDecision = await eligibility.evaluate(shipped);
    assert.strictEqual(shippedDecision.eligible, false);
    assert(shippedDecision.items[0].reasons.includes('FULFILLMENT_ALREADY_SHIPPED'));

    const zero = clone(base);
    zero.cancellationEligibility.ownerEvidence.inventory.items[0].releasableQuantity = '0.00';
    zero.cancellationEligibility.ownerEvidence.fulfillment.items[0].cancellableQuantity = '0.00';
    const zeroDecision = await eligibility.evaluate(zero);
    assert.strictEqual(zeroDecision.items[0].requiredActions.inventory, 'NONE');
    assert.strictEqual(zeroDecision.items[0].requiredActions.fulfillment, 'NONE');

    const numeric = clone(base);
    numeric.cancellationEligibility.items[0].requestedQuantity = 1;
    await assert.rejects(eligibility.evaluate(numeric), (error) => error.code === 'ERR_ORD_00047');

    const missingEvidence = clone(base);
    missingEvidence.cancellationEligibility.ownerEvidence.inventory.items = [];
    await assert.rejects(eligibility.evaluate(missingEvidence), /owner evidence is incomplete/);

    const mismatchedUnit = clone(base);
    mismatchedUnit.cancellationEligibility.ownerEvidence.inventory.items[0].unitCode = 'KG';
    await assert.rejects(eligibility.evaluate(mismatchedUnit), /unit does not match/);

    const duplicate = clone(base);
    duplicate.cancellationEligibility.items.push(clone(duplicate.cancellationEligibility.items[0]));
    await assert.rejects(eligibility.evaluate(duplicate), /duplicate Order entries/);

    const expired = clone(base);
    expired.cancellationEligibility.order.placedAt = '2026-08-01T09:00:00.000Z';
    await assert.rejects(eligibility.evaluate(expired), (error) => error.code === 'ERR_ORD_00048');

    const unsafe = clone(base);
    unsafe.cancellationEligibility.ownerEvidence.payment.rawGatewayPayload = { secret: 'prohibited' };
    await assert.rejects(eligibility.evaluate(unsafe), /prohibited raw or secret data/);

    const delegated = clone(base);
    const provided = delegated.cancellationEligibility.ownerEvidence;
    delete delegated.cancellationEligibility.ownerEvidence;
    let calls = 0;
    Object.entries(config.evidenceProviders).forEach(([owner, descriptor]) => {
        SERVICE[descriptor.service] = { resolve: async (request) => {
            calls += 1;
            assert.strictEqual(request.orderCode, 'order-1');
            return provided[owner];
        } };
    });
    const delegatedDecision = await eligibility.evaluate(delegated);
    assert.strictEqual(delegatedDecision.eligible, true);
    assert.strictEqual(calls, 4);

    console.log('Order cancellation eligibility contract validated');
})().catch((error) => { console.error(error); process.exit(1); });
