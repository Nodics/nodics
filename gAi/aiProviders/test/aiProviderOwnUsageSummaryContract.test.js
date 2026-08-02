/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/test/AiProviderOwnUsageSummaryContract
 * @description Verifies employee ownership, exact totals, and low-disclosure usage projection.
 * @layer test
 * @owner aiProviders
 */
const assert = require('assert');
const service = require('../src/service/token/defaultAiTokenLedgerOperationsService');
const routes = require('../src/router/routers').aiProviders.aiTokenLedgerOperations;

let observedBudgetQuery;
let observedUsageQuery;
global.SERVICE = {
    DefaultAiTokenLedgerService: {
        configuration: () => ({ tokenOptimization: { costScale: 8 } })
    },
    DefaultAiTokenLedgerRepositoryService: {
        listBudgets: query => {
            observedBudgetQuery = query;
            return Promise.resolve({ result: [{
                budgetCode: 'hidden-budget', period: 'MONTHLY',
                windowStart: new Date('2026-07-01'), windowEnd: new Date('2026-08-01'),
                currencyCode: 'USD', maximumTokens: 1000, reservedTokens: 100,
                consumedTokens: 250, maximumCost: '10.00000000',
                reservedCost: '1.00000000', consumedCost: '2.50000000',
                providerCode: 'hidden-provider', modelCode: 'hidden-model'
            }] });
        },
        listUsage: query => {
            observedUsageQuery = query;
            return Promise.resolve({ result: [
                { usageCode: 'hidden-1', reservationCode: 'hidden-r1',
                    currencyCode: 'USD', totalTokens: 10, cost: '0.10000000' },
                { usageCode: 'hidden-2', reservationCode: 'hidden-r2',
                    currencyCode: 'USD', totalTokens: 20, cost: '0.20000000' }
            ] });
        }
    }
};

assert.strictEqual(routes.ownUsageSummary.key, '/operations/ai-ledger/usage/me');
assert.strictEqual(routes.ownUsageSummary.permission, 'ai.usage.readOwn');

service.ownSummary({
    tenant: 'tenant-a',
    authData: { principalType: 'human', principalId: 'employee-a' }
}).then(result => {
    assert.deepStrictEqual(observedBudgetQuery, {
        tenantCode: 'tenant-a', principalCode: 'employee-a'
    });
    assert.deepStrictEqual(observedUsageQuery, observedBudgetQuery);
    assert.strictEqual(result.usageByCurrency[0].totalTokens, 30);
    assert.strictEqual(result.usageByCurrency[0].cost, '0.30000000');
    assert.strictEqual(result.usageRecordCount, 2);
    assert.strictEqual(JSON.stringify(result).includes('hidden-'), false);
    return assert.rejects(
        service.ownSummary({
            tenant: 'tenant-a',
            authData: { principalType: 'service', principalId: 'module-a' }
        }),
        /human principal/
    );
}).then(() => {
    console.log('AI provider own usage summary contract validated');
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
