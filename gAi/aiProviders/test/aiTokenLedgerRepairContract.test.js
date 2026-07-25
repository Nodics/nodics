/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/test/aiTokenLedgerRepairContract
 * @description Proves dry-run, deterministic recovery, uncertain evidence, idempotency, concurrency-safe reconstruction, and service identity.
 * @layer test
 * @owner aiProviders
 */
const assert = require('assert');
const defaults = require('../config/properties').aiProviders;
const ledger = require('../src/service/token/defaultAiTokenLedgerService');
const repair = require('../src/service/token/defaultAiTokenLedgerRepairService');
const metrics = require('../src/service/token/defaultAiTokenLedgerMetricsService');

function store() {
    const budgets = new Map();
    const reservations = new Map();
    const usage = new Map();
    const runs = new Map();
    const findings = new Map();
    return {
        budgets, reservations, usage, runs, findings,
        getBudget: code => budgets.get(code),
        compareAndSwapBudget: (code, revision, patch) => {
            const value = budgets.get(code);
            if (!value || value.revision !== revision) return 0;
            budgets.set(code, Object.assign({}, value, patch, { revision: revision + 1 }));
            return 1;
        },
        getReservation: code => reservations.get(code),
        updateReservation: (code, revision, state, patch) => {
            const value = reservations.get(code);
            if (!value || value.revision !== revision || value.state !== state) return 0;
            reservations.set(code, Object.assign({}, value, patch, { revision: revision + 1 }));
            return 1;
        },
        getUsage: code => usage.get(code),
        createUsage: model => {
            if (usage.has(model.usageCode)) throw new Error('duplicate usage');
            usage.set(model.usageCode, Object.assign({}, model));
            return model;
        },
        listBudgetReservations: code => Array.from(reservations.values()).filter(value => value.budgetCode === code),
        listBudgetUsage: code => Array.from(usage.values()).filter(value => value.budgetCode === code),
        findRepairCandidates: (_cutoff, limit, offset) => Array.from(reservations.values())
            .filter(value => ['RECONCILING', 'RELEASING', 'UNCERTAIN'].includes(value.state))
            .slice(offset || 0, Number(offset || 0) + limit),
        getRepairRun: code => runs.get(code),
        createRepairRun: model => { runs.set(model.runCode, Object.assign({}, model)); return model; },
        updateRepairRun: (code, patch) => {
            runs.set(code, Object.assign({}, runs.get(code), patch));
            return 1;
        },
        getRepairFinding: code => findings.get(code),
        createRepairFinding: model => { findings.set(model.findingCode, Object.assign({}, model)); return model; },
        updateRepairFinding: (code, state, patch) => {
            const value = findings.get(code);
            if (!value || value.state !== state) return 0;
            findings.set(code, Object.assign({}, value, patch));
            return 1;
        }
    };
}

function reservation(code, state) {
    return {
        reservationCode: code, budgetCode: 'budget-1', tenantCode: 'tenant-a',
        state: state, revision: 0, reservedTokens: 100, reservedCost: '0.10000000',
        currencyCode: 'USD', updatedAt: new Date(0),
        tokenPlan: {
            profileCode: 'assistantGeneration', provider: 'testProvider', model: 'model-a',
            pricingRevision: 'price-1', configurationRevision: 'config-1'
        }
    };
}

const configuration = JSON.parse(JSON.stringify(defaults));
configuration.enabled = true;
configuration.ledger.repair.staleTransitionSeconds = 1;
configuration.pricing.models['testProvider:model-a'] = {
    revision: 'price-1', currencyCode: 'USD',
    inputPerMillion: '1.00000000', outputPerMillion: '2.00000000'
};
const repository = store();
repository.budgets.set('budget-1', {
    budgetCode: 'budget-1', revision: 0, reservedTokens: 400, consumedTokens: 0,
    reservedCost: '0.40000000', consumedCost: '0.00000000'
});
['releasing', 'reconciling-used', 'reconciling-unknown', 'uncertain'].forEach((code, index) => {
    repository.reservations.set(code, reservation(code,
        index === 0 ? 'RELEASING' : index === 3 ? 'UNCERTAIN' : 'RECONCILING'));
});
repository.usage.set('reconciling-used', {
    usageCode: 'reconciling-used', reservationCode: 'reconciling-used',
    budgetCode: 'budget-1', totalTokens: 50, cost: '0.05000000'
});

const context = {
    tenant: 'tenant-a', authData: { tokenType: 'service', principalId: 'cronjob' },
    _aiProviderConfiguration: configuration, tokenLedgerRepository: repository
};
global.SERVICE = {
    DefaultAiTokenLedgerService: ledger,
    DefaultAiTokenLedgerMetricsService: metrics
};

(async () => {
    metrics.reset();
    await assert.rejects(repair.scan({
        idempotencyKey: 'repair-human-0001',
        context: Object.assign({}, context, { authData: { tokenType: 'access' } })
    }), /service identity/);

    const preview = await repair.scan({
        idempotencyKey: 'repair-preview-0001', dryRun: true, context: context
    });
    assert.strictEqual(preview.findingCount, 4);
    assert.strictEqual(preview.repairedCount, 0);
    assert.strictEqual(repository.reservations.get('releasing').state, 'RELEASING');
    assert.strictEqual((await repair.scan({
        idempotencyKey: 'repair-preview-0001', dryRun: true, context: context
    })).runCode, preview.runCode, 'Completed scan must be idempotent');

    const applied = await repair.scan({
        idempotencyKey: 'repair-apply-0001', dryRun: false, context: context
    });
    assert.strictEqual(applied.repairedCount, 3);
    assert.strictEqual(repository.reservations.get('releasing').state, 'RELEASED');
    assert.strictEqual(repository.reservations.get('reconciling-used').state, 'RECONCILED');
    assert.strictEqual(repository.reservations.get('reconciling-unknown').state, 'UNCERTAIN');
    assert.strictEqual(repository.reservations.get('uncertain').state, 'UNCERTAIN');
    assert.strictEqual(repository.budgets.get('budget-1').reservedTokens, 200);
    assert.strictEqual(repository.budgets.get('budget-1').consumedTokens, 50);

    await assert.rejects(repair.reconcileUncertain({
        evidence: { reservationId: 'reconciling-unknown', evidenceSource: 'CALLER', usage: {} },
        context: context
    }), /positive provider usage evidence/);

    const reconciled = await repair.reconcileUncertain({
        evidence: {
            reservationId: 'reconciling-unknown', providerRequestId: 'provider-request-1',
            evidenceSource: 'PROVIDER', usage: { inputTokens: 30, outputTokens: 20 }
        },
        context: context
    });
    assert.strictEqual(reconciled.state, 'RECONCILED');
    assert.strictEqual(repository.reservations.get('reconciling-unknown').state, 'RECONCILED');
    assert.strictEqual(repository.budgets.get('budget-1').reservedTokens, 100);
    assert.strictEqual(repository.budgets.get('budget-1').consumedTokens, 100);
    assert.strictEqual(repository.usage.get('reconciling-unknown').providerRequestId, 'provider-request-1');
    assert.strictEqual(repository.usage.get('reconciling-unknown').evidenceSource, 'PROVIDER');
    assert(Object.keys(metrics.snapshot(context).counters).some(key => key.includes('uncertainReconciliation')));
    assert.deepStrictEqual(metrics.snapshot({ tenant: 'tenant-b' }).counters, {},
        'Process-local diagnostics must remain tenant-filtered');

    const pagingConfiguration = JSON.parse(JSON.stringify(configuration));
    pagingConfiguration.ledger.repair.batchSize = 2;
    const pagingRepository = store();
    pagingRepository.budgets.set('budget-1', repository.budgets.get('budget-1'));
    ['page-1', 'page-2', 'page-3'].forEach(code => {
        pagingRepository.reservations.set(code, reservation(code, 'UNCERTAIN'));
    });
    const pagingContext = Object.assign({}, context, {
        _aiProviderConfiguration: pagingConfiguration, tokenLedgerRepository: pagingRepository
    });
    const pageOne = await repair.scan({
        idempotencyKey: 'repair-paging-0001', dryRun: true, context: pagingContext
    });
    assert.strictEqual(pageOne.state, 'PARTIAL');
    assert.strictEqual(pageOne.findingCount, 2);
    const pageTwo = await repair.scan({
        idempotencyKey: 'repair-paging-0001', dryRun: true, context: pagingContext
    });
    assert.strictEqual(pageTwo.state, 'COMPLETED');
    assert.strictEqual(pageTwo.findingCount, 3);

    const manualConfiguration = JSON.parse(JSON.stringify(configuration));
    manualConfiguration.ledger.repair.deterministicRepairApprovalMode = 'MANUAL';
    const manualRepository = store();
    manualRepository.budgets.set('budget-1', {
        budgetCode: 'budget-1', revision: 0, reservedTokens: 100, consumedTokens: 0,
        reservedCost: '0.10000000', consumedCost: '0.00000000'
    });
    manualRepository.reservations.set('manual-releasing', reservation('manual-releasing', 'RELEASING'));
    const manualContext = Object.assign({}, context, {
        _aiProviderConfiguration: manualConfiguration, tokenLedgerRepository: manualRepository
    });
    const manualRun = await repair.scan({
        idempotencyKey: 'repair-manual-0001', dryRun: false, context: manualContext
    });
    const manualFinding = manualRun.findings[0];
    assert.strictEqual(manualRepository.reservations.get('manual-releasing').state, 'RELEASING');
    await assert.rejects(repair.approveFinding({
        findingCode: manualFinding.findingCode, context: manualContext
    }), /human identity/);
    const humanContext = Object.assign({}, manualContext, {
        authData: { tokenType: 'access', principalId: 'repair-approver' }
    });
    await repair.approveFinding({
        findingCode: manualFinding.findingCode, note: 'Reviewed evidence', context: humanContext
    });
    assert.strictEqual(manualRepository.findings.get(manualFinding.findingCode).approvedBy, 'repair-approver');
    await repair.applyFinding({ findingCode: manualFinding.findingCode, context: manualContext });
    assert.strictEqual(manualRepository.reservations.get('manual-releasing').state, 'RELEASED');

    console.log('AI token ledger repair and reconciliation contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
