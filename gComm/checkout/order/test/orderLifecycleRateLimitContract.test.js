/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/test/orderLifecycleRateLimitContract @description Protects shared persistence-backed customer lifecycle rate limits and idempotent replay. @layer test @owner order */
const assert = require('assert'); const properties = require('../config/properties'); global.CONFIG = { get: key => key === 'order' ? properties.order : undefined };
let records = []; const matches = (item, query) => Object.entries(query || {}).every(([key, value]) => value && typeof value === 'object' && value.$gte ? new Date(item[key]).getTime() >= new Date(value.$gte).getTime() : item[key] === value);
global.SERVICE = { DefaultOrderLifecycleRequestService: { get: async request => ({ result: records.filter(item => matches(item, request.query)).slice(0, request.searchOptions.limit) }) } };
const service = require('../src/service/lifecycle/defaultOrderLifecycleRateLimitService'); const request = key => ({ tenant: 'default', now: '2026-08-03T12:00:00.000Z', authData: { tokenType: 'access', principalId: 'customer-1', customerCode: 'customer-1' }, body: { entCode: 'ent-1', orderCode: 'order-1', idempotencyKey: key } });
(async () => { let policy = properties.order.orderLifecycle.intents.rateLimit, originalMax = policy.max; policy.max = 2; let allowed = await service.assertAllowed(request('key-3'), request('key-3').body); assert.strictEqual(allowed.remaining, 1); records = [{ entCode: 'ent-1', orderCode: 'order-1', requesterCode: 'customer-1', requesterType: 'CUSTOMER', idempotencyKey: 'key-1', submittedAt: new Date('2026-08-03T11:59:30.000Z') }, { entCode: 'ent-1', orderCode: 'order-1', requesterCode: 'customer-1', requesterType: 'CUSTOMER', idempotencyKey: 'key-2', submittedAt: new Date('2026-08-03T11:59:45.000Z') }]; await assert.rejects(() => service.assertAllowed(request('key-3'), request('key-3').body), error => error.code === 'ERR_ORD_00067'); let replay = await service.assertAllowed(request('key-1'), request('key-1').body); assert.strictEqual(replay.idempotent, true); policy.max = originalMax; console.log('Order lifecycle rate limit contract validated'); })().catch(error => { console.error(error); process.exit(1); });
