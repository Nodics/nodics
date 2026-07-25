/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const configuration = require('../config/properties').aiProviders;
const service = require('../src/service/token/defaultAiTokenEconomicsService');

assert.strictEqual(service.calculateCost({
    inputTokens: 1000000,
    outputTokens: 500000
}, {
    inputPerMillion: '1.25000000',
    outputPerMillion: '2.50000000'
}, 8), '2.50000000');
assert.strictEqual(service.calculateCost({ inputTokens: 1 }, {
    inputPerMillion: '0.00000001'
}, 8), '0.00000001', 'Cost must conservatively round up at configured scale');

const enabled = JSON.parse(JSON.stringify(configuration));
enabled.enabled = true;
const plan = service.plan({
    configuration: enabled,
    profileCode: 'assistantGeneration',
    provider: 'testProvider',
    model: 'testModel',
    estimatedInputTokens: 1200,
    requestedOutputTokens: 100,
    rates: { revision: 'rate-1', currencyCode: 'USD', inputPerMillion: '1.00000000', outputPerMillion: '2.00000000' },
    configurationRevision: 'revision-1',
    optimizations: ['EVIDENCE_DEDUPLICATION']
});
assert(Object.isFrozen(plan));
assert.strictEqual(plan.reservedOutputTokens, 1000);
assert.strictEqual(plan.estimatedCost, '0.00320000');

assert.throws(() => service.plan(Object.assign({}, {
    configuration: enabled,
    profileCode: 'assistantGeneration',
    provider: 'testProvider',
    model: 'testModel',
    requestedOutputTokens: 1000,
    rates: { revision: 'rate-1', currencyCode: 'USD' }
}, { estimatedInputTokens: 24001 })), /input token budget exceeded/);

const costly = JSON.parse(JSON.stringify(enabled));
costly.tokenOptimization.profiles.assistantGeneration.maximumEstimatedCost = '0.00000001';
assert.throws(() => service.plan({
    configuration: costly,
    profileCode: 'assistantGeneration',
    provider: 'testProvider',
    model: 'testModel',
    estimatedInputTokens: 100,
    requestedOutputTokens: 1000,
    rates: { revision: 'rate-1', currencyCode: 'USD', inputPerMillion: '1.00000000', outputPerMillion: '1.00000000' }
}), /estimated cost budget exceeded/);

const events = [];
const ledger = {
    reserve: input => {
        events.push('reserve');
        return { reservationId: 'reservation1', tokenPlan: input.tokenPlan };
    },
    reconcile: () => events.push('reconcile'),
    release: () => events.push('release'),
    markUncertain: () => events.push('uncertain')
};

(async () => {
    const reservation = await service.reserve(plan, 'idempotency-1', { tenant: 'default' }, ledger);
    const reconciliation = await service.reconcile(reservation, {
        inputTokens: 1000, outputTokens: 500
    }, {
        revision: 'rate-1', currencyCode: 'USD',
        inputPerMillion: '1.00000000', outputPerMillion: '2.00000000'
    }, enabled, { tenant: 'default' }, ledger);
    assert.strictEqual(reconciliation.actualCost, '0.00200000');
    assert.strictEqual(reconciliation.state, 'RECONCILED');
    assert.deepStrictEqual(events, ['reserve', 'reconcile']);
    await assert.rejects(service.reserve(plan, 'short', {}, ledger), /idempotency key/);
    await assert.rejects(service.reserve(plan, 'idempotency-2', {}, undefined), /ledger reservation authority/);
    await service.markUncertain(reservation, 'PROVIDER_TIMEOUT', {}, ledger);
    assert.strictEqual(events[2], 'uncertain');
    console.log('AI token economics contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
