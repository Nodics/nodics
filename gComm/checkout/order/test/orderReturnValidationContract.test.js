/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module order/test/orderReturnValidationContract @description Protects exact, side-effect-free Return validation and configured authorization routing. @layer test @owner order */
const assert = require('assert');
const properties = require('../config/properties');
global.CONFIG = { get: key => key === 'order' ? properties.order : undefined };
global.SERVICE = {};
const validation = require('../src/service/lifecycle/defaultOrderReturnValidationService');
const authorization = require('../src/service/lifecycle/defaultOrderReturnAuthorizationService');

const input = (quantity, deliveredAt, product) => ({
    tenant: 'default', authData: { tokenType: 'service' }, now: '2026-08-03T00:00:00.000Z',
    returnValidation: {
        entCode: 'ent-1', orderCode: 'order-1', items: [{ orderEntryCode: 'entry-1', unitCode: 'EA', requestedQuantity: quantity }],
        ownerEvidence: {
            fulfillment: { items: [{ orderEntryCode: 'entry-1', unitCode: 'EA', deliveredQuantity: '3.000', alreadyReturnedQuantity: '1.250', deliveredAt: deliveredAt, fulfillmentCodes: ['cons-1'] }] },
            product: { items: [{ orderEntryCode: 'entry-1', returnAllowed: product !== false, returnWindowDays: 30, policyCode: 'STANDARD', reasonCode: product === false ? 'PRODUCT_NOT_RETURNABLE' : undefined }] },
        },
    },
});

(async () => {
    const validInput = validation.validate(input('1.750', '2026-07-10T00:00:00.000Z'));
    const evidence = await validation.resolve(input('1.750', '2026-07-10T00:00:00.000Z'), validInput);
    const eligible = validation.evaluate(input('1.750', '2026-07-10T00:00:00.000Z'), validInput, evidence);
    assert.strictEqual(eligible.eligible, true);
    assert.strictEqual(eligible.items[0].returnableQuantity, '1.750');
    assert.throws(() => validation.validate(input('0', '2026-07-10T00:00:00.000Z')), /quantity is invalid/);

    let overInput = validation.validate(input('1.751', '2026-07-10T00:00:00.000Z'));
    let over = validation.evaluate(input('1.751', '2026-07-10T00:00:00.000Z'), overInput, await validation.resolve(input('1.751', '2026-07-10T00:00:00.000Z'), overInput));
    assert.deepStrictEqual(over.items[0].reasons, ['REQUESTED_QUANTITY_EXCEEDS_RETURNABLE']);
    let expiredInput = validation.validate(input('1', '2026-06-01T00:00:00.000Z'));
    let expired = validation.evaluate(input('1', '2026-06-01T00:00:00.000Z'), expiredInput, await validation.resolve(input('1', '2026-06-01T00:00:00.000Z'), expiredInput));
    assert(expired.items[0].reasons.includes('RETURN_WINDOW_EXPIRED'));
    let blockedInput = validation.validate(input('1', '2026-07-10T00:00:00.000Z', false));
    let blocked = validation.evaluate(input('1', '2026-07-10T00:00:00.000Z', false), blockedInput, await validation.resolve(input('1', '2026-07-10T00:00:00.000Z', false), blockedInput));
    assert(blocked.items[0].reasons.includes('PRODUCT_NOT_RETURNABLE'));

    let routed = authorization.prepare({ returnAuthorization: { request: { requestCode: 'return-1', version: 2, requestType: 'RETURN', requesterType: 'CUSTOMER' }, validation: eligible } });
    assert.strictEqual(routed.route, 'MANUAL_REVIEW');
    properties.order.orderLifecycle.returnAuthorization.autoApprovalEnabled = true;
    properties.order.orderLifecycle.returnAuthorization.autoApprovalRequesterTypes.push('CUSTOMER');
    routed = authorization.prepare({ returnAuthorization: { request: { requestCode: 'return-1', version: 2, requestType: 'RETURN', requesterType: 'CUSTOMER' }, validation: eligible } });
    assert.strictEqual(routed.route, 'AUTO_APPROVE');
    console.log('Order Return validation contract validated');
})().catch(error => { console.error(error); process.exit(1); });
