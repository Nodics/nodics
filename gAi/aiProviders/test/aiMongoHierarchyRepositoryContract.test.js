/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

const persisted = new Map();
let transactionSequence = 0;
global.SERVICE = {
    DefaultDatabaseTransactionService: {
        capabilities: () => ({ multiRecordAtomic: true }),
        execute: async (scope, work) => {
            assert.deepStrictEqual(scope, { moduleName: 'aiProviders', tenant: 'tenant-a' });
            const token = { transactionSequence: ++transactionSequence, values: new Map(persisted) };
            const result = await work(token);
            persisted.clear(); token.values.forEach((value, key) => persisted.set(key, value));
            return result;
        }
    },
    DefaultAiTokenBudgetService: {
        get: input => {
            const value = input.transactionContext.values.get(input.query.budgetCode);
            return { result: value ? [Object.assign({}, value)] : [] };
        },
        save: input => {
            input.transactionContext.values.set(input.model.budgetCode, Object.assign({}, input.model));
            return input.model;
        },
        update: input => {
            const current = input.transactionContext.values.get(input.query.budgetCode);
            if (!current || current.revision !== input.query.revision) {
                return { result: { modifiedCount: 0 } };
            }
            input.transactionContext.values.set(input.query.budgetCode,
                Object.assign({}, current, input.model));
            return { result: { modifiedCount: 1 } };
        }
    }
};

const repository = require('../src/service/token/defaultAiTokenLedgerRepositoryService');
const context = { tenant: 'tenant-a' };
const common = {
    active: true, period: 'MONTH', windowStart: new Date(), windowEnd: new Date(),
    currencyCode: 'USD', maximumTokens: 100, maximumCost: '1.00000000',
    reservedTokens: 0, consumedTokens: 0, reservedCost: '0.00000000',
    consumedCost: '0.00000000', revision: 0
};
const budgets = ['a', 'b'].map(code => Object.assign({}, common, {
    code: code, budgetCode: code, scopeKey: code
}));

(async () => {
    assert.strictEqual(repository.capabilities(context).atomicBudgetHierarchy, true);
    await repository.mutateBudgetHierarchy({
        operation: 'CLAIM', budgets: budgets,
        values: { reservedTokens: 60, reservedCost: '0.10000000', costScale: 8 }
    }, context);
    assert.strictEqual(persisted.get('a').reservedTokens, 60);
    assert.strictEqual(persisted.get('b').reservedTokens, 60);

    await assert.rejects(repository.mutateBudgetHierarchy({
        operation: 'CLAIM', budgets: budgets,
        values: { reservedTokens: 50, reservedCost: '0.10000000', costScale: 8 }
    }, context), /hierarchical token budget exceeded/);
    assert.strictEqual(persisted.get('a').reservedTokens, 60);
    assert.strictEqual(persisted.get('b').reservedTokens, 60,
        'An aborted repository transaction must preserve every previous account value');
    console.log('AI transactional hierarchy repository contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
