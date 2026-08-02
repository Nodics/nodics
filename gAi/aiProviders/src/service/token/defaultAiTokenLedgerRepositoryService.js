/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/src/service/token/defaultAiTokenLedgerRepositoryService
 * @description Adapts the persistent AI ledger to Nodics-generated model services with revision-guarded writes.
 * @layer service
 * @owner aiProviders
 * @override Projects may replace AI ledger persistence orchestration while
 * preserving generated-service usage, tenant scoping, revision guards,
 * immutable usage, and provider-neutral nDatabase transactions. Database
 * drivers and native transaction mechanics remain owned by nDatabase adapters.
 */
function items(response) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    return Array.isArray(response.result) ? response.result : [];
}

function affected(response) {
    if (typeof response === 'number') return response;
    if (!response) return 0;
    if (response.result !== undefined) return affected(response.result);
    return Number(response.modifiedCount || response.nModified || response.matchedCount || response.n || 0);
}

const economics = require('./defaultAiTokenEconomicsService');

module.exports = {
    /**
     * Reports persistence guarantees. The generated-service repository does not
     * claim multi-record transaction support.
     */
    capabilities: function (context) {
        const transactionService = typeof SERVICE !== 'undefined' && SERVICE.DefaultDatabaseTransactionService;
        const capability = transactionService && transactionService.capabilities({
            moduleName: 'aiProviders', tenant: context && (context.tenant || context.tenantCode)
        });
        return {
            atomicBudgetHierarchy: !!(capability && capability.multiRecordAtomic === true),
            databaseTransaction: capability || { multiRecordAtomic: false }
        };
    },

    /** Mutates every hierarchical account inside one provider-neutral database transaction. */
    mutateBudgetHierarchy: function (input, context) {
        const transactionService = typeof SERVICE !== 'undefined' && SERVICE.DefaultDatabaseTransactionService;
        if (!transactionService) {
            return Promise.reject(new Error(
                'AI hierarchical budgets require a repository with atomicBudgetHierarchy capability'));
        }
        const budgets = input.budgets.slice().sort((left, right) =>
            left.budgetCode.localeCompare(right.budgetCode));
        return transactionService.execute({
            moduleName: 'aiProviders', tenant: context.tenant || context.tenantCode
        }, async transactionContext => {
            for (const model of budgets) {
                let current = await this.getBudget(model.budgetCode, context, transactionContext);
                if (!current) {
                    if (input.operation !== 'CLAIM' || !model.scopeKey) {
                        throw new Error('AI hierarchical budget account does not exist: ' + model.budgetCode);
                    }
                    await this.createBudget(model, context, transactionContext);
                    current = await this.getBudget(model.budgetCode, context, transactionContext);
                }
                const patch = this.hierarchyPatch(input.operation, current, input.values);
                const changed = await this.compareAndSwapBudget(model.budgetCode,
                    Number(current.revision || 0), patch, context, transactionContext);
                if (changed !== 1) {
                    throw new Error('AI hierarchical budget transaction lost account revision: ' + model.budgetCode);
                }
            }
            return true;
        });
    },

    /** Calculates one exact hierarchy mutation and validates claim ceilings. */
    hierarchyPatch: function (operation, current, values) {
        const scale = values.costScale;
        if (operation === 'CLAIM') {
            const reservedTokens = Number(current.reservedTokens || 0) + values.reservedTokens;
            const reservedCost = economics.addExact(current.reservedCost || '0', values.reservedCost, scale);
            if (!Number.isSafeInteger(reservedTokens) ||
                reservedTokens + Number(current.consumedTokens || 0) > Number(current.maximumTokens)) {
                throw new Error('AI hierarchical token budget exceeded: ' + current.budgetCode);
            }
            if (economics.compareExact(economics.addExact(reservedCost,
                current.consumedCost || '0', scale), current.maximumCost) > 0) {
                throw new Error('AI hierarchical cost budget exceeded: ' + current.budgetCode);
            }
            return { reservedTokens: reservedTokens, reservedCost: reservedCost };
        }
        if (operation === 'UNCLAIM') {
            return {
                reservedTokens: Number(current.reservedTokens || 0) - values.reservedTokens,
                reservedCost: economics.subtractExact(current.reservedCost || '0', values.reservedCost, scale)
            };
        }
        if (operation === 'CONSUME') {
            return {
                reservedTokens: Number(current.reservedTokens || 0) - values.reservedTokens,
                consumedTokens: Number(current.consumedTokens || 0) + values.actualTokens,
                reservedCost: economics.subtractExact(current.reservedCost || '0', values.reservedCost, scale),
                consumedCost: economics.addExact(current.consumedCost || '0', values.actualCost, scale)
            };
        }
        throw new Error('Unsupported AI hierarchical budget operation: ' + operation);
    },

    /** Loads one reservation by its tenant-scoped code. */
    getReservation: async function (reservationCode, context) {
        return items(await SERVICE.DefaultAiTokenReservationService.get({
            tenant: context.tenant, authData: context.authData,
            query: { reservationCode: reservationCode }, searchOptions: { limit: 1 }
        }))[0];
    },

    /** Inserts idempotency evidence before budget mutation. */
    createReservation: function (model, context) {
        return SERVICE.DefaultAiTokenReservationService.save({
            tenant: context.tenant, authData: context.authData, model: model
        });
    },

    /** Applies one guarded reservation lifecycle transition. */
    updateReservation: async function (reservationCode, revision, state, patch, context) {
        const response = await SERVICE.DefaultAiTokenReservationService.update({
            tenant: context.tenant, authData: context.authData,
            query: { reservationCode: reservationCode, revision: revision, state: state },
            model: Object.assign({}, patch, { revision: revision + 1 })
        });
        return affected(response);
    },

    /** Loads one effective-window budget account. */
    getBudget: async function (budgetCode, context, transactionContext) {
        return items(await SERVICE.DefaultAiTokenBudgetService.get({
            tenant: context.tenant, authData: context.authData,
            query: { budgetCode: budgetCode }, searchOptions: { limit: 1 },
            transactionContext: transactionContext
        }))[0];
    },

    /** Creates one exact-value budget account. */
    createBudget: function (model, context, transactionContext) {
        return SERVICE.DefaultAiTokenBudgetService.save({
            tenant: context.tenant, authData: context.authData, model: model,
            transactionContext: transactionContext
        });
    },

    /** Atomically changes one budget revision when the expected revision still owns the row. */
    compareAndSwapBudget: async function (budgetCode, revision, patch, context, transactionContext) {
        const response = await SERVICE.DefaultAiTokenBudgetService.update({
            tenant: context.tenant, authData: context.authData,
            query: { budgetCode: budgetCode, revision: revision },
            model: Object.assign({}, patch, { revision: revision + 1 }),
            transactionContext: transactionContext
        });
        return affected(response);
    },

    /** Inserts immutable normalized provider usage evidence. */
    createUsage: function (model, context) {
        return SERVICE.DefaultAiTokenUsageRecordService.save({
            tenant: context.tenant, authData: context.authData, model: model
        });
    },

    /** Loads immutable usage evidence for one reservation. */
    getUsage: async function (reservationCode, context) {
        return items(await SERVICE.DefaultAiTokenUsageRecordService.get({
            tenant: context.tenant, authData: context.authData,
            query: { reservationCode: reservationCode }, searchOptions: { limit: 1 }
        }))[0];
    },

    /** Loads bounded reservation evidence for one budget reconstruction. */
    listBudgetReservations: async function (budgetCode, limit, context) {
        return items(await SERVICE.DefaultAiTokenReservationService.get({
            tenant: context.tenant, authData: context.authData,
            query: { $or: [{ budgetCode: budgetCode }, { budgetCodes: budgetCode }] },
            searchOptions: { limit: limit }
        }));
    },

    /** Loads bounded immutable usage evidence for one budget reconstruction. */
    listBudgetUsage: async function (budgetCode, limit, context) {
        return items(await SERVICE.DefaultAiTokenUsageRecordService.get({
            tenant: context.tenant, authData: context.authData,
            query: { $or: [{ budgetCode: budgetCode }, { budgetCodes: budgetCode }] },
            searchOptions: { limit: limit }
        }));
    },

    /** Finds bounded stale transitional and uncertain reservations. */
    findRepairCandidates: async function (cutoff, limit, offset, context) {
        return items(await SERVICE.DefaultAiTokenReservationService.get({
            tenant: context.tenant, authData: context.authData,
            query: {
                state: { $in: ['RECONCILING', 'RELEASING', 'UNCERTAIN'] },
                updatedAt: { $lte: cutoff }
            },
            searchOptions: {
                pageSize: limit, pageNumber: Math.floor(Number(offset || 0) / limit) + 1,
                limit: limit, sort: { updatedAt: 1, reservationCode: 1 }
            }
        }));
    },

    /** Loads one idempotent repair run. */
    getRepairRun: async function (runCode, context) {
        return items(await SERVICE.DefaultAiTokenRepairRunService.get({
            tenant: context.tenant, authData: context.authData,
            query: { runCode: runCode }, searchOptions: { limit: 1 }
        }))[0];
    },

    /** Creates persistent repair-run evidence. */
    createRepairRun: function (model, context) {
        return SERVICE.DefaultAiTokenRepairRunService.save({
            tenant: context.tenant, authData: context.authData, model: model
        });
    },

    /** Updates persistent repair-run progress. */
    updateRepairRun: function (runCode, patch, context) {
        return SERVICE.DefaultAiTokenRepairRunService.update({
            tenant: context.tenant, authData: context.authData,
            query: { runCode: runCode }, model: patch
        });
    },

    /** Loads one deterministic repair finding. */
    getRepairFinding: async function (findingCode, context) {
        return items(await SERVICE.DefaultAiTokenRepairFindingService.get({
            tenant: context.tenant, authData: context.authData,
            query: { findingCode: findingCode }, searchOptions: { limit: 1 }
        }))[0];
    },

    /** Creates persistent repair finding evidence. */
    createRepairFinding: function (model, context) {
        return SERVICE.DefaultAiTokenRepairFindingService.save({
            tenant: context.tenant, authData: context.authData, model: model
        });
    },

    /** Resolves one repair finding without deletion. */
    updateRepairFinding: function (findingCode, state, patch, context) {
        return SERVICE.DefaultAiTokenRepairFindingService.update({
            tenant: context.tenant, authData: context.authData,
            query: { findingCode: findingCode, state: state }, model: patch
        });
    },

    /** Returns bounded repair-run evidence. */
    listRepairRuns: function (query, limit, context) {
        return SERVICE.DefaultAiTokenRepairRunService.get({
            tenant: context.tenant, authData: context.authData,
            query: query, searchOptions: { limit: limit, sort: { startedAt: -1 } }
        });
    },

    /** Returns bounded repair-finding evidence. */
    listRepairFindings: function (query, limit, context) {
        return SERVICE.DefaultAiTokenRepairFindingService.get({
            tenant: context.tenant, authData: context.authData,
            query: query, searchOptions: { limit: limit, sort: { updatedAt: -1 } }
        });
    },

    /** Returns a bounded set of expired non-terminal reservations. */
    findExpiredReservations: async function (at, limit, context) {
        return items(await SERVICE.DefaultAiTokenReservationService.get({
            tenant: context.tenant, authData: context.authData,
            query: { state: { $in: ['PENDING', 'RESERVED'] }, expiresAt: { $lte: at } },
            searchOptions: { limit: limit, sort: { expiresAt: 1 } }
        }));
    },

    /** Returns bounded operational reservation evidence. */
    listReservations: function (query, limit, context) {
        return SERVICE.DefaultAiTokenReservationService.get({
            tenant: context.tenant, authData: context.authData,
            query: query, searchOptions: { limit: limit, sort: { reservedAt: -1 } }
        });
    },

    /** Returns bounded operational budget evidence. */
    listBudgets: function (query, limit, context) {
        return SERVICE.DefaultAiTokenBudgetService.get({
            tenant: context.tenant, authData: context.authData,
            query: query, searchOptions: { limit: limit, sort: { windowEnd: -1 } }
        });
    },

    /** Returns bounded immutable usage evidence. */
    listUsage: function (query, limit, context) {
        return SERVICE.DefaultAiTokenUsageRecordService.get({
            tenant: context.tenant, authData: context.authData,
            query: query, searchOptions: { limit: limit, sort: { recordedAt: -1 } }
        });
    }
};
