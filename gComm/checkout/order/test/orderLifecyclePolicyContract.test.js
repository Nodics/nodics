/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available contract test. */
const assert = require('assert');
const properties = require('../config/properties');
global.CONFIG = { get: key => key === 'order' ? properties.order : undefined };
const policy = require('../src/service/lifecycle/defaultOrderLifecyclePolicyService');
const configuration = properties.order.orderLifecycle.policy;
assert.strictEqual(policy.cancellationWindow({ tenant: 'tenant-a', enterpriseCode: 'ent-a', siteCode: 'site-a', channelCode: 'web', productType: 'PHYSICAL' }).windowMinutes, 1440);
assert.strictEqual(policy.returnWindow({ productCode: 'sku-1', categoryCode: 'cat-1', countryCode: 'AE', customerSegment: 'STANDARD', channelCode: 'web' }).deliveryAgeDays, 30);
assert(configuration.refundableAmounts[0].outcomes.includes('RESTOCKING_FEE'));
assert.strictEqual(policy.productRestriction({ productType: 'DIGITAL', categoryCode: 'software' }).refundable, true);
assert.strictEqual(policy.approvalEscalation({ enterpriseCode: 'ent-a', countryCode: 'AE', paymentMethodCode: 'CARD' }).makerCheckerRequired, true);
assert(policy.evidenceRequirement({ requestType: 'RETURN' }).supportedEvidence.includes('SERIAL_NUMBER'));
assert.strictEqual(policy.lifecycleTimer({ requestType: 'RETURN', state: 'INFORMATION_REQUESTED' }).abandonedState, 'CANCELLED');
assert.strictEqual(policy.exceptionRoute({ findingCode: 'PROVIDER_FAILURE' }).owner, 'payment');
assert.throws(() => policy.exceptionRoute({ findingCode: 'UNKNOWN' }), /No governed exception route/);
console.log('Order lifecycle policy contract validated');
