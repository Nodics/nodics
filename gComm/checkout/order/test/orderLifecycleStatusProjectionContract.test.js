/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/test/orderLifecycleStatusProjectionContract @description Protects customer-safe lifecycle quantity and expected-action projections. @layer test @owner order */
const assert = require('assert');
const properties = require('../config/properties');
global.CONFIG = { get: key => key === 'order' ? properties.order : undefined };
const service = require('../src/service/lifecycle/defaultOrderLifecycleStatusProjectionService');

let approved = service.project({ request: { requestCode: 'return-1', requestType: 'RETURN', state: 'AUTHORIZED', updatedAt: '2026-08-03T10:00:00.000Z' }, items: [{ orderEntryCode: 'entry-1', requestedQuantity: '1.5', unitCode: 'EA' }] });
assert.strictEqual(approved.statusProjection.quantities[0].approvedQuantity, '1.5');
assert.strictEqual(approved.statusProjection.quantities[0].rejectedQuantity, '0');
assert.strictEqual(approved.statusProjection.timeline.expectedActionMinutes, undefined);
let pending = service.project({ request: { requestCode: 'refund-1', requestType: 'REFUND', state: 'APPROVAL_PENDING', updatedAt: '2026-08-03T10:00:00.000Z' }, items: [{ orderEntryCode: 'entry-2', requestedQuantity: '2', unitCode: 'EA' }] });
assert.strictEqual(pending.statusProjection.quantities[0].approvedQuantity, '0');
assert.strictEqual(pending.statusProjection.timeline.expectedActionAt.toISOString(), '2026-08-04T10:00:00.000Z');
let rejected = service.project({ request: { requestCode: 'cancel-1', requestType: 'CANCELLATION', state: 'REJECTED' }, items: [{ orderEntryCode: 'entry-3', requestedQuantity: '1', unitCode: 'EA' }] });
assert.strictEqual(rejected.statusProjection.quantities[0].rejectedQuantity, '1');
console.log('Order lifecycle status projection contract validated');
