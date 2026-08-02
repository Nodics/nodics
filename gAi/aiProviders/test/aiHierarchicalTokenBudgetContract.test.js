/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const defaults = require('../config/properties').aiProviders;
const economics = require('../src/service/token/defaultAiTokenEconomicsService');
const ledger = require('../src/service/token/defaultAiTokenLedgerService');

function repository(atomic) {
    const budgets = new Map(); const reservations = new Map(); const usage = new Map();
    return {
        budgets: budgets, reservations: reservations, usage: usage,
        capabilities: () => ({ atomicBudgetHierarchy: atomic === true }),
        getReservation: code => reservations.get(code),
        createReservation: model => { reservations.set(model.reservationCode, Object.assign({}, model)); },
        updateReservation: (code, revision, state, patch) => {
            const current = reservations.get(code);
            if (!current || current.revision !== revision || current.state !== state) return 0;
            reservations.set(code, Object.assign({}, current, patch, { revision: revision + 1 })); return 1;
        },
        getBudget: code => budgets.get(code),
        createBudget: model => budgets.set(model.budgetCode, Object.assign({}, model)),
        compareAndSwapBudget: () => 0,
        createUsage: model => usage.set(model.usageCode, Object.assign({}, model)),
        findExpiredReservations: () => [],
        mutateBudgetHierarchy: input => {
            if (atomic !== true) throw new Error('not atomic');
            const next = new Map(budgets);
            input.budgets.forEach(model => {
                const current = Object.assign({}, next.get(model.budgetCode) || model);
                const values = input.values; const scale = values.costScale;
                if (input.operation === 'CLAIM') {
                    current.reservedTokens += values.reservedTokens;
                    current.reservedCost = economics.addExact(current.reservedCost, values.reservedCost, scale);
                    if (current.reservedTokens + current.consumedTokens > current.maximumTokens ||
                        economics.compareExact(economics.addExact(current.reservedCost,
                            current.consumedCost, scale), current.maximumCost) > 0) {
                        throw new Error('AI hierarchical budget exceeded');
                    }
                } else if (input.operation === 'UNCLAIM') {
                    current.reservedTokens -= values.reservedTokens;
                    current.reservedCost = economics.subtractExact(current.reservedCost, values.reservedCost, scale);
                } else if (input.operation === 'CONSUME') {
                    current.reservedTokens -= values.reservedTokens;
                    current.consumedTokens += values.actualTokens;
                    current.reservedCost = economics.subtractExact(current.reservedCost, values.reservedCost, scale);
                    current.consumedCost = economics.addExact(current.consumedCost, values.actualCost, scale);
                }
                current.revision = Number(current.revision || 0) + 1;
                next.set(model.budgetCode, current);
            });
            budgets.clear(); next.forEach((value, key) => budgets.set(key, value));
            return true;
        }
    };
}

function plan() {
    return {
        contractVersion: 1, profileCode: 'assistantGeneration', provider: 'openAi',
        model: 'model-a', estimatedInputTokens: 40, reservedOutputTokens: 60,
        estimatedCost: '0.10000000', currencyCode: 'USD',
        configurationRevision: 'config-1', pricingRevision: 'price-1', optimizations: []
    };
}

const configuration = JSON.parse(JSON.stringify(defaults));
configuration.enabled = true;
configuration.ledger.budget.hierarchy.enabled = true;
configuration.ledger.budget.defaultMaximumTokens = 150;
configuration.ledger.budget.defaultMaximumCost = '0.15000000';
const store = repository(true);
const context = {
    tenant: 'tenant-a', enterpriseCode: 'enterprise-a', applicationCode: 'axis',
    authData: { principalId: 'employee-a' }, _aiProviderConfiguration: configuration,
    tokenLedgerRepository: store
};

(async () => {
    const reservation = await ledger.reserve({
        tokenPlan: plan(), idempotencyKey: 'hierarchy-turn-0001', context: context
    });
    assert.strictEqual(reservation.budgetCodes.length, 7);
    assert.strictEqual(store.budgets.size, 7);
    store.budgets.forEach(value => assert.strictEqual(value.reservedTokens, 100));

    await assert.rejects(ledger.reserve({
        tokenPlan: plan(), idempotencyKey: 'hierarchy-turn-0002', context: context
    }), /hierarchical budget exceeded/);
    assert.strictEqual(store.budgets.size, 7);
    store.budgets.forEach(value => assert.strictEqual(value.reservedTokens, 100),
        'A rejected hierarchy must not partially mutate any account');

    await ledger.reconcile({
        reconciliation: {
            reservationId: reservation.reservationId,
            actualUsage: { inputTokens: 30, outputTokens: 20 },
            actualCost: '0.05000000', currencyCode: 'USD', state: 'RECONCILED'
        },
        context: context
    });
    store.budgets.forEach(value => {
        assert.strictEqual(value.reservedTokens, 0);
        assert.strictEqual(value.consumedTokens, 50);
    });

    const nonAtomic = repository(false);
    await assert.rejects(ledger.reserve({
        tokenPlan: plan(), idempotencyKey: 'hierarchy-non-atomic', context: Object.assign({}, context, {
            tokenLedgerRepository: nonAtomic
        })
    }), /atomicBudgetHierarchy/);
    assert.strictEqual(nonAtomic.budgets.size, 0);
    console.log('AI hierarchical token budget contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
