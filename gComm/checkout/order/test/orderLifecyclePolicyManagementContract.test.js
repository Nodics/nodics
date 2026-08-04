/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available contract test. */
const assert = require('assert'); let current = { entCode: 'ent-1', policyCode: 'policy-1', policyType: 'RETURN_WINDOW', scope: {}, rule: {}, status: 'DRAFT', version: 1, updatedByPrincipalId: 'maker-1' }; const persistence = { get: async () => ({ result: [current] }), update: async request => ({ result: current = Object.assign({}, current, request.model) }) }; global.SERVICE = { DefaultOrderLifecyclePolicyRuleService: persistence, DefaultOrderLifecycleReasonService: persistence }; const service = require('../src/service/lifecycle/defaultOrderLifecyclePolicyManagementService'), request = (actor, body) => ({ tenant: 'default', authData: { tokenType: 'access', principalId: actor }, body: Object.assign({ entCode: 'ent-1', policyCode: 'policy-1', expectedVersion: current.version }, body) }); (async () => { let updated = await service.managePolicy(request('maker-1', { action: 'UPDATE', rule: { deliveryAgeDays: 45 } })); assert.strictEqual(updated.version, 2); await assert.rejects(service.managePolicy(request('maker-1', { action: 'ACTIVATE' })), /maker/); let active = await service.managePolicy(request('checker-1', { action: 'ACTIVATE', reasonCode: 'APPROVED' })); assert.strictEqual(active.status, 'ACTIVE'); await assert.rejects(service.managePolicy(request('checker-1', { action: 'UPDATE', expectedVersion: 1, rule: {} })), /stale/); await assert.rejects(service.authorizeMutation({}), /Direct/); assert.strictEqual((await service.authorizeMutation({ _orderLifecyclePolicyMutationAuthorized: true }))._orderLifecyclePolicyMutationAuthorized, true); console.log('Order lifecycle policy management contract validated'); })().catch(error => { console.error(error); process.exit(1); });
