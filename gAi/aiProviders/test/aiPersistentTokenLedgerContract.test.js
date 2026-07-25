/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const defaults = require('../config/properties').aiProviders;
const ledger = require('../src/service/token/defaultAiTokenLedgerService');

function repository() {
    const budgets = new Map();
    const reservations = new Map();
    const usage = new Map();
    return {
        budgets: budgets,
        reservations: reservations,
        usage: usage,
        getReservation: code => reservations.get(code),
        createReservation: model => {
            if (reservations.has(model.reservationCode)) throw new Error('duplicate reservation');
            reservations.set(model.reservationCode, Object.assign({}, model));
            return model;
        },
        updateReservation: (code, revision, state, patch) => {
            const current = reservations.get(code);
            if (!current || current.revision !== revision || current.state !== state) return 0;
            reservations.set(code, Object.assign({}, current, patch, { revision: revision + 1 }));
            return 1;
        },
        getBudget: code => budgets.get(code),
        createBudget: model => {
            if (budgets.has(model.budgetCode)) throw new Error('duplicate budget');
            budgets.set(model.budgetCode, Object.assign({}, model));
            return model;
        },
        compareAndSwapBudget: (code, revision, patch) => {
            const current = budgets.get(code);
            if (!current || current.revision !== revision) return 0;
            budgets.set(code, Object.assign({}, current, patch, { revision: revision + 1 }));
            return 1;
        },
        createUsage: model => {
            if (usage.has(model.usageCode)) throw new Error('duplicate usage');
            usage.set(model.usageCode, Object.assign({}, model));
            return model;
        },
        findExpiredReservations: at => Array.from(reservations.values())
            .filter(value => ['PENDING', 'RESERVED'].includes(value.state) && value.expiresAt <= at),
        listReservations: () => ({ result: Array.from(reservations.values()) }),
        listBudgets: () => ({ result: Array.from(budgets.values()) }),
        listUsage: () => ({ result: Array.from(usage.values()) })
    };
}

function plan(cost) {
    return {
        contractVersion: 1, profileCode: 'assistantGeneration', provider: 'openAi',
        model: 'model-a', estimatedInputTokens: 40, reservedOutputTokens: 60,
        estimatedCost: cost || '0.10000000', currencyCode: 'USD',
        configurationRevision: 'config-1', pricingRevision: 'price-1', optimizations: []
    };
}

const configuration = JSON.parse(JSON.stringify(defaults));
configuration.enabled = true;
configuration.ledger.budget.defaultMaximumTokens = 250;
configuration.ledger.budget.defaultMaximumCost = '0.25000000';
const store = repository();
const context = {
    tenant: 'tenant-a', enterpriseCode: 'enterprise-a', applicationCode: 'axis',
    authData: { principalId: 'employee-a' }, _aiProviderConfiguration: configuration,
    tokenLedgerRepository: store, correlationId: 'request-a'
};

(async () => {
    const first = await ledger.reserve({
        tokenPlan: plan(), idempotencyKey: 'assistant-turn-0001', context: context
    });
    assert.strictEqual(first.state, 'RESERVED');
    assert.strictEqual(store.budgets.values().next().value.reservedTokens, 100);
    assert.strictEqual((await ledger.reserve({
        tokenPlan: plan(), idempotencyKey: 'assistant-turn-0001', context: context
    })).reservationId, first.reservationId, 'Same request must be idempotent');
    await assert.rejects(ledger.reserve({
        tokenPlan: Object.assign({}, plan(), { model: 'model-b' }),
        idempotencyKey: 'assistant-turn-0001', context: context
    }), /reused with a different request/);

    await ledger.reconcile({
        reconciliation: {
            reservationId: first.reservationId,
            actualUsage: { inputTokens: 30, outputTokens: 20 },
            actualCost: '0.05000000', currencyCode: 'USD', state: 'RECONCILED'
        },
        context: context
    });
    const afterUsage = store.budgets.values().next().value;
    assert.strictEqual(afterUsage.reservedTokens, 0);
    assert.strictEqual(afterUsage.consumedTokens, 50);
    assert.strictEqual(afterUsage.consumedCost, '0.05000000');
    assert.strictEqual(store.usage.size, 1);

    const released = await ledger.reserve({
        tokenPlan: plan(), idempotencyKey: 'assistant-turn-0002', context: context
    });
    await ledger.release({ reservationId: released.reservationId, reason: 'CANCELLED', context: context });
    assert.strictEqual(store.reservations.get(released.reservationId).state, 'RELEASED');

    const uncertain = await ledger.reserve({
        tokenPlan: plan(), idempotencyKey: 'assistant-turn-0003', context: context
    });
    await ledger.markUncertain({ reservationId: uncertain.reservationId, reason: 'TIMEOUT', context: context });
    assert.strictEqual(store.reservations.get(uncertain.reservationId).state, 'UNCERTAIN');
    assert.strictEqual(store.budgets.values().next().value.reservedTokens, 100,
        'Uncertain usage must retain its reservation');
    await assert.rejects(ledger.reserve({
        tokenPlan: plan(), idempotencyKey: 'assistant-turn-0003', context: context
    }), /requires governed repair: UNCERTAIN/,
    'An idempotent retry must not invoke the provider again while usage is uncertain');

    await assert.rejects(ledger.reserve({
        tokenPlan: plan('0.20000000'), idempotencyKey: 'assistant-turn-0004', context: context
    }), /budget exceeded/);

    const expiryStore = repository();
    const expiryContext = Object.assign({}, context, { tokenLedgerRepository: expiryStore });
    const expiring = await ledger.reserve({
        tokenPlan: plan(), idempotencyKey: 'assistant-turn-expiring', context: expiryContext
    });
    expiryStore.reservations.get(expiring.reservationId).expiresAt = new Date(0);
    const expiry = await ledger.expire({ at: new Date(), context: expiryContext });
    assert.deepStrictEqual({ scanned: expiry.scanned, expired: expiry.expired }, { scanned: 1, expired: 1 });
    assert.strictEqual(expiryStore.budgets.values().next().value.reservedTokens, 0);

    const concurrentStore = repository();
    const concurrentContext = Object.assign({}, context, { tokenLedgerRepository: concurrentStore });
    const outcomes = await Promise.allSettled(['0001', '0002', '0003'].map(value => ledger.reserve({
        tokenPlan: plan(), idempotencyKey: 'concurrent-turn-' + value, context: concurrentContext
    })));
    assert.strictEqual(outcomes.filter(value => value.status === 'fulfilled').length, 2);
    assert.strictEqual(outcomes.filter(value => value.status === 'rejected').length, 1);
    assert.strictEqual(concurrentStore.budgets.values().next().value.reservedTokens, 200);

    console.log('AI persistent token ledger contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
