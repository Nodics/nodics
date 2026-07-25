/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/service/token/defaultAiTokenLedgerService
 * @description Owns tenant-scoped persistent AI budget reservation, release, reconciliation, uncertainty, expiry, and audit lifecycle.
 * @layer service
 * @owner aiProviders
 * @override Projects may replace repository or policy resolution while preserving fail-closed CAS, idempotency, exact values, and evidence.
 */
const crypto = require('crypto');
const economics = require('./defaultAiTokenEconomicsService');
const configurationService = require('../config/defaultAiProviderConfigurationService');

function hash(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function totalTokens(usage) {
    return ['inputTokens', 'outputTokens', 'cachedInputTokens', 'embeddingTokens']
        .reduce((total, key) => {
            const value = Number((usage || {})[key] || 0);
            if (!Number.isSafeInteger(value) || value < 0) throw new Error('AI usage contains invalid token count: ' + key);
            const next = total + value;
            if (!Number.isSafeInteger(next)) throw new Error('AI total token usage exceeds safe integer range');
            return next;
        }, 0);
}

function periodWindow(period, value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) throw new Error('AI ledger date is invalid');
    const start = period === 'DAY' ?
        new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())) :
        new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    const end = period === 'DAY' ?
        new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)) :
        new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
    return { start: start, end: end };
}

module.exports = {
    /** Resolves the authoritative effective configuration supplied by the gateway. */
    configuration: function (context) {
        const configuration = context && context._aiProviderConfiguration;
        configurationService.validate(configuration);
        return configuration;
    },

    /** Resolves the persistent repository extension point. */
    repository: function (context) {
        return context && context.tokenLedgerRepository ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultAiTokenLedgerRepositoryService);
    },

    /** Builds normalized identity without accepting provider/model choices from the caller. */
    scope: function (plan, context, configuration) {
        const tenantCode = String(context.tenant || context.tenantCode || '').trim();
        if (!tenantCode) throw new Error('AI ledger requires tenant identity');
        const authData = context.authData || {};
        const values = {
            tenantCode: tenantCode,
            enterpriseCode: context.enterpriseCode || authData.enterpriseCode,
            applicationCode: context.applicationCode || authData.applicationCode,
            principalCode: authData.principalId || authData.userId || context.principalCode,
            profileCode: plan.profileCode,
            providerCode: plan.provider,
            modelCode: plan.model
        };
        const dimensions = configuration.ledger.budget.scopeDimensions;
        const identity = dimensions.map(key => key + '=' + String(values[key] || '*')).join('|');
        return Object.assign(values, { scopeKey: hash(identity) });
    },

    /** Builds one named hierarchical scope from an approved subset of dimensions. */
    hierarchicalScope: function (plan, context, dimensions, levelCode) {
        const tenantCode = String(context.tenant || context.tenantCode || '').trim();
        if (!tenantCode) throw new Error('AI ledger requires tenant identity');
        const authData = context.authData || {};
        const values = {
            tenantCode: tenantCode,
            enterpriseCode: context.enterpriseCode || authData.enterpriseCode,
            applicationCode: context.applicationCode || authData.applicationCode,
            principalCode: authData.principalId || authData.userId || context.principalCode,
            profileCode: plan.profileCode,
            providerCode: plan.provider,
            modelCode: plan.model
        };
        const identity = dimensions.map(key => key + '=' + String(values[key] || '*')).join('|');
        return Object.assign(values, {
            tenantCode: tenantCode,
            scopeLevel: levelCode,
            scopeKey: hash(levelCode + '|' + identity)
        });
    },

    /** Creates a deterministic effective-window budget model. */
    budgetModel: function (plan, context, configuration) {
        const policy = configuration.ledger.budget;
        if (policy.currencyCode !== plan.currencyCode) throw new Error('AI ledger budget currency does not match token plan');
        const scope = this.scope(plan, context, configuration);
        const window = periodWindow(policy.period, context.at);
        const budgetCode = hash(scope.scopeKey + '|' + window.start.toISOString() + '|' + policy.period);
        return Object.assign({
            code: budgetCode, active: true, budgetCode: budgetCode, period: policy.period,
            windowStart: window.start, windowEnd: window.end, currencyCode: policy.currencyCode,
            maximumTokens: policy.defaultMaximumTokens, maximumCost: policy.defaultMaximumCost,
            reservedTokens: 0, consumedTokens: 0, reservedCost: '0.00000000',
            consumedCost: '0.00000000', revision: 0
        }, scope);
    },

    /** Builds every deterministic account participating in one hierarchical decision. */
    budgetModels: function (plan, context, configuration) {
        const policy = configuration.ledger.budget;
        if (policy.hierarchy.enabled !== true) return [this.budgetModel(plan, context, configuration)];
        if (policy.currencyCode !== plan.currencyCode) throw new Error('AI ledger budget currency does not match token plan');
        const window = periodWindow(policy.period, context.at);
        return policy.hierarchy.levels.map(level => {
            const scope = this.hierarchicalScope(plan, context, level.dimensions, level.code);
            const budgetCode = hash(scope.scopeKey + '|' + window.start.toISOString() + '|' + policy.period);
            return Object.assign({
                code: budgetCode, active: true, budgetCode: budgetCode, period: policy.period,
                windowStart: window.start, windowEnd: window.end, currencyCode: policy.currencyCode,
                maximumTokens: policy.defaultMaximumTokens, maximumCost: policy.defaultMaximumCost,
                reservedTokens: 0, consumedTokens: 0, reservedCost: '0.00000000',
                consumedCost: '0.00000000', revision: 0
            }, scope);
        }).sort((left, right) => left.budgetCode.localeCompare(right.budgetCode));
    },

    /** Verifies and invokes the all-account transaction extension point. */
    mutateBudgetHierarchy: function (repository, operation, models, values, context) {
        const capabilities = typeof repository.capabilities === 'function' ? repository.capabilities(context) : {};
        if (!capabilities || capabilities.atomicBudgetHierarchy !== true ||
            typeof repository.mutateBudgetHierarchy !== 'function') {
            return Promise.reject(new Error(
                'AI hierarchical budgets require a repository with atomicBudgetHierarchy capability'));
        }
        return repository.mutateBudgetHierarchy({
            operation: operation,
            budgets: models.slice().sort((left, right) => left.budgetCode.localeCompare(right.budgetCode)),
            values: values
        }, context);
    },

    /** Loads or safely creates a budget account; unique-index races are resolved by reload. */
    ensureBudget: async function (model, repository, context) {
        let existing = await repository.getBudget(model.budgetCode, context);
        if (existing) return existing;
        try {
            await repository.createBudget(model, context);
        } catch (error) {
            existing = await repository.getBudget(model.budgetCode, context);
            if (!existing) throw error;
            return existing;
        }
        return await repository.getBudget(model.budgetCode, context) || model;
    },

    /** Applies one exact revision-guarded budget mutation with bounded CAS retries. */
    mutateBudget: async function (budgetCode, context, mutate) {
        const configuration = this.configuration(context);
        const repository = this.repository(context);
        if (!repository) throw new Error('AI persistent token ledger repository is unavailable');
        for (let attempt = 0; attempt < configuration.ledger.maximumCompareAndSwapAttempts; attempt += 1) {
            const current = await repository.getBudget(budgetCode, context);
            if (!current) throw new Error('AI token budget does not exist');
            const patch = mutate(current, configuration.tokenOptimization.costScale);
            if (await repository.compareAndSwapBudget(budgetCode, Number(current.revision || 0), patch, context) === 1) {
                return Object.assign({}, current, patch, { revision: Number(current.revision || 0) + 1 });
            }
        }
        throw new Error('AI token budget concurrency retry limit exceeded');
    },

    /** Atomically claims exact capacity in one effective budget account. */
    claimBudget: function (budgetCode, tokens, cost, context) {
        return this.mutateBudget(budgetCode, context, (current, scale) => {
            const reservedTokens = Number(current.reservedTokens || 0) + tokens;
            const totalTokensValue = reservedTokens + Number(current.consumedTokens || 0);
            const reservedCost = economics.addExact(current.reservedCost || '0', cost, scale);
            const totalCost = economics.addExact(reservedCost, current.consumedCost || '0', scale);
            if (!Number.isSafeInteger(totalTokensValue) || totalTokensValue > Number(current.maximumTokens)) {
                throw new Error('AI token ledger budget exceeded');
            }
            if (economics.compareExact(totalCost, current.maximumCost) > 0) {
                throw new Error('AI cost ledger budget exceeded');
            }
            return { reservedTokens: reservedTokens, reservedCost: reservedCost };
        });
    },

    /** Releases claimed capacity without changing consumed evidence. */
    unclaimBudget: function (budgetCode, tokens, cost, context) {
        return this.mutateBudget(budgetCode, context, (current, scale) => ({
            reservedTokens: Number(current.reservedTokens || 0) - tokens,
            reservedCost: economics.subtractExact(current.reservedCost || '0', cost, scale)
        }));
    },

    /** Moves a reservation to consumed exact usage, retaining honest overage. */
    consumeBudget: function (budgetCode, reservedTokens, reservedCost, actualTokens, actualCost, context) {
        return this.mutateBudget(budgetCode, context, (current, scale) => ({
            reservedTokens: Number(current.reservedTokens || 0) - reservedTokens,
            consumedTokens: Number(current.consumedTokens || 0) + actualTokens,
            reservedCost: economics.subtractExact(current.reservedCost || '0', reservedCost, scale),
            consumedCost: economics.addExact(current.consumedCost || '0', actualCost, scale)
        }));
    },

    /** Creates an idempotent persistent reservation and claims budget through CAS. */
    reserve: async function (input) {
        const context = input.context || {};
        const configuration = this.configuration(context);
        const repository = this.repository(context);
        if (!repository) throw new Error('AI persistent token ledger repository is unavailable');
        const plan = input.tokenPlan;
        const scope = this.scope(plan, context, configuration);
        const reservationCode = hash(scope.tenantCode + '|' + input.idempotencyKey);
        const requestHash = hash(JSON.stringify(plan) + '|' + scope.scopeKey);
        let existing = await repository.getReservation(reservationCode, context);
        if (existing) {
            if (existing.requestHash !== requestHash) throw new Error('AI idempotency key was reused with a different request');
            if (existing.state === 'PENDING') throw new Error('AI idempotent reservation is still being created');
            if (['UNCERTAIN', 'RECONCILING', 'RELEASING'].includes(existing.state)) {
                throw new Error('AI idempotent reservation requires governed repair: ' + existing.state);
            }
            if (['RELEASED', 'EXPIRED', 'REJECTED'].includes(existing.state)) {
                throw new Error('AI idempotent reservation is already terminal: ' + existing.state);
            }
            return this.projection(existing);
        }
        const budgetModels = this.budgetModels(plan, context, configuration);
        const hierarchical = configuration.ledger.budget.hierarchy.enabled === true;
        const budget = hierarchical ? budgetModels[budgetModels.length - 1] :
            await this.ensureBudget(budgetModels[0], repository, context);
        const budgetCodes = budgetModels.map(value => value.budgetCode);
        const reservedTokens = plan.estimatedInputTokens + plan.reservedOutputTokens;
        const now = new Date();
        const model = Object.assign({
            code: reservationCode, active: true, reservationCode: reservationCode,
            idempotencyKey: input.idempotencyKey, requestHash: requestHash, budgetCode: budget.budgetCode,
            budgetCodes: budgetCodes,
            budgetScopes: budgetModels.map(value => ({ budgetCode: value.budgetCode, scopeLevel: value.scopeLevel || 'composite' })),
            state: 'PENDING', tokenPlan: plan, reservedTokens: reservedTokens,
            reservedCost: plan.estimatedCost, currencyCode: plan.currencyCode, reservedAt: now,
            expiresAt: new Date(now.getTime() + configuration.ledger.reservationTtlSeconds * 1000), revision: 0
        }, scope);
        try {
            await repository.createReservation(model, context);
        } catch (error) {
            existing = await repository.getReservation(reservationCode, context);
            if (!existing || existing.requestHash !== requestHash) throw error;
            if (existing.state === 'PENDING') throw new Error('AI idempotent reservation is still being created');
            return this.projection(existing);
        }
        let claimed = false;
        try {
            if (hierarchical) {
                await this.mutateBudgetHierarchy(repository, 'CLAIM', budgetModels, {
                    reservedTokens: reservedTokens, reservedCost: plan.estimatedCost,
                    costScale: configuration.tokenOptimization.costScale
                }, context);
            } else {
                await this.claimBudget(budget.budgetCode, reservedTokens, plan.estimatedCost, context);
            }
            claimed = true;
            if (await repository.updateReservation(reservationCode, 0, 'PENDING', { state: 'RESERVED' }, context) !== 1) {
                throw new Error('AI reservation activation lost its revision');
            }
            return this.projection(Object.assign({}, model, { state: 'RESERVED', revision: 1 }));
        } catch (error) {
            if (claimed) {
                if (hierarchical) {
                    await this.mutateBudgetHierarchy(repository, 'UNCLAIM', budgetModels, {
                        reservedTokens: reservedTokens, reservedCost: plan.estimatedCost,
                        costScale: configuration.tokenOptimization.costScale
                    }, context);
                } else {
                    await this.unclaimBudget(budget.budgetCode, reservedTokens, plan.estimatedCost, context);
                }
            }
            await repository.updateReservation(reservationCode, 0, 'PENDING', {
                state: 'REJECTED', failureCode: error.code || error.message, terminalAt: new Date()
            }, context);
            throw error;
        }
    },

    /** Reconciles normalized actual usage exactly once and writes immutable usage evidence. */
    reconcile: async function (input) {
        const context = input.context || {};
        const repository = this.repository(context);
        const record = await repository.getReservation(input.reconciliation.reservationId, context);
        if (!record) throw new Error('AI token reservation does not exist');
        if (record.state === 'RECONCILED') return true;
        if (!['RESERVED', 'UNCERTAIN'].includes(record.state)) throw new Error('AI reservation cannot be reconciled from state: ' + record.state);
        const usage = input.reconciliation.actualUsage || {};
        const actualTokens = totalTokens(usage);
        const claimed = await repository.updateReservation(record.reservationCode, Number(record.revision || 0),
            record.state, { state: 'RECONCILING' }, context);
        if (claimed !== 1) throw new Error('AI reservation reconciliation lost its revision');
        try {
            const configuration = this.configuration(context);
            if (configuration.ledger.budget.hierarchy.enabled === true) {
                await this.mutateBudgetHierarchy(repository, 'CONSUME',
                    (record.budgetCodes || [record.budgetCode]).map(code => ({ budgetCode: code })), {
                        reservedTokens: record.reservedTokens, reservedCost: record.reservedCost,
                        actualTokens: actualTokens, actualCost: input.reconciliation.actualCost,
                        costScale: configuration.tokenOptimization.costScale
                    }, context);
            } else {
                await this.consumeBudget(record.budgetCode, record.reservedTokens, record.reservedCost,
                    actualTokens, input.reconciliation.actualCost, context);
            }
        } catch (error) {
            await repository.updateReservation(record.reservationCode, Number(record.revision || 0) + 1,
                'RECONCILING', { state: record.state, failureCode: error.code || error.message }, context);
            throw error;
        }
        const now = new Date();
        const changed = await repository.updateReservation(record.reservationCode, Number(record.revision || 0) + 1,
            'RECONCILING', {
                state: 'RECONCILED', actualUsage: usage, actualTokens: actualTokens,
                actualCost: input.reconciliation.actualCost, terminalAt: now
            }, context);
        if (changed !== 1) throw new Error('AI reservation reconciliation lost its revision');
        await repository.createUsage({
            code: record.reservationCode, active: true, usageCode: record.reservationCode,
            reservationCode: record.reservationCode, budgetCode: record.budgetCode,
            budgetCodes: record.budgetCodes || [record.budgetCode],
            tenantCode: record.tenantCode, enterpriseCode: record.enterpriseCode,
            applicationCode: record.applicationCode, principalCode: record.principalCode,
            profileCode: record.tokenPlan.profileCode, providerCode: record.tokenPlan.provider,
            modelCode: record.tokenPlan.model, usage: usage, totalTokens: actualTokens,
            cost: input.reconciliation.actualCost, currencyCode: record.currencyCode,
            pricingRevision: record.tokenPlan.pricingRevision,
            configurationRevision: record.tokenPlan.configurationRevision,
            outcome: input.reconciliation.state, recordedAt: now,
            correlationId: context.correlationId || context.requestId,
            providerRequestId: context.providerRequestId,
            evidenceSource: context.evidenceSource
        }, context);
        return true;
    },

    /** Releases a pre-invocation reservation exactly once. */
    release: async function (input) {
        const context = input.context || {};
        const repository = this.repository(context);
        const record = await repository.getReservation(input.reservationId, context);
        if (!record || record.state === 'RELEASED') return false;
        if (record.state !== 'RESERVED') throw new Error('AI reservation cannot be released from state: ' + record.state);
        const claimed = await repository.updateReservation(record.reservationCode, Number(record.revision || 0),
            'RESERVED', { state: 'RELEASING' }, context);
        if (claimed !== 1) throw new Error('AI reservation release lost its revision');
        try {
            const configuration = this.configuration(context);
            if (configuration.ledger.budget.hierarchy.enabled === true) {
                await this.mutateBudgetHierarchy(repository, 'UNCLAIM',
                    (record.budgetCodes || [record.budgetCode]).map(code => ({ budgetCode: code })), {
                        reservedTokens: record.reservedTokens, reservedCost: record.reservedCost,
                        costScale: configuration.tokenOptimization.costScale
                    }, context);
            } else {
                await this.unclaimBudget(record.budgetCode, record.reservedTokens, record.reservedCost, context);
            }
        } catch (error) {
            await repository.updateReservation(record.reservationCode, Number(record.revision || 0) + 1,
                'RELEASING', { state: 'RESERVED', failureCode: error.code || error.message }, context);
            throw error;
        }
        const changed = await repository.updateReservation(record.reservationCode, Number(record.revision || 0) + 1,
            'RELEASING', { state: 'RELEASED', failureCode: input.reason, terminalAt: new Date() }, context);
        if (changed !== 1) throw new Error('AI reservation release lost its revision');
        return true;
    },

    /** Retains claimed budget after provider invocation when usage is unknown. */
    markUncertain: async function (input) {
        const context = input.context || {};
        const repository = this.repository(context);
        const record = await repository.getReservation(input.reservationId, context);
        if (!record) throw new Error('AI token reservation does not exist');
        if (record.state === 'UNCERTAIN') return true;
        if (record.state !== 'RESERVED') throw new Error('AI reservation cannot become uncertain from state: ' + record.state);
        const changed = await repository.updateReservation(record.reservationCode, Number(record.revision || 0),
            'RESERVED', {
                state: 'UNCERTAIN', failureCode: input.reason, invokedAt: new Date(),
                expiresAt: new Date(Date.now() + this.configuration(context).ledger.uncertainRetentionSeconds * 1000)
            }, context);
        if (changed !== 1) throw new Error('AI uncertain reservation lost its revision');
        return true;
    },

    /** Expires a bounded batch of pre-invocation reservations and releases their claims. */
    expire: async function (input) {
        const context = input.context || {};
        const configuration = this.configuration(context);
        const repository = this.repository(context);
        const at = input.at ? new Date(input.at) : new Date();
        const records = await repository.findExpiredReservations(at, configuration.ledger.expiryBatchSize, context);
        let expired = 0;
        for (const record of records) {
            if (record.state === 'RESERVED') {
                if (configuration.ledger.budget.hierarchy.enabled === true) {
                    await this.mutateBudgetHierarchy(repository, 'UNCLAIM',
                        (record.budgetCodes || [record.budgetCode]).map(code => ({ budgetCode: code })), {
                            reservedTokens: record.reservedTokens, reservedCost: record.reservedCost,
                            costScale: configuration.tokenOptimization.costScale
                        }, context);
                } else {
                    await this.unclaimBudget(record.budgetCode, record.reservedTokens, record.reservedCost, context);
                }
            }
            const changed = await repository.updateReservation(record.reservationCode, Number(record.revision || 0),
                record.state, { state: 'EXPIRED', failureCode: 'RESERVATION_EXPIRED', terminalAt: at }, context);
            expired += changed;
        }
        return { scanned: records.length, expired: expired, at: at.toISOString() };
    },

    /** Returns the provider-gateway reservation contract without persistence internals. */
    projection: function (record) {
        return {
            reservationId: record.reservationCode, idempotencyKey: record.idempotencyKey,
            state: record.state, tokenPlan: record.tokenPlan,
            budgetCodes: record.budgetCodes || [record.budgetCode],
            reservedAt: new Date(record.reservedAt).toISOString(),
            expiresAt: new Date(record.expiresAt).toISOString()
        };
    }
};
