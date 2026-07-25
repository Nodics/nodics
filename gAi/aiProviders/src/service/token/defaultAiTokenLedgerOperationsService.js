/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/service/token/defaultAiTokenLedgerOperationsService
 * @description Provides bounded tenant-scoped ledger administration, reporting, and recovery operations.
 * @layer service
 * @owner aiProviders
 * @override Projects may extend safe projections and filters without exposing secrets or bypassing ledger lifecycle services.
 */
const economics = require('./defaultAiTokenEconomicsService');

module.exports = {
    /** Resolves the authenticated human principal without accepting a query override. */
    humanPrincipal: function (request) {
        const authData = request.authData || {};
        if (authData.principalType !== 'human') {
            throw new Error('AI usage summary requires an authenticated human principal');
        }
        const principalCode = authData.principalId || authData.userId || authData.loginId;
        if (!principalCode) throw new Error('AI usage summary requires principal identity');
        return String(principalCode);
    },
    /** Resolves a bounded list limit. */
    limit: function (request) {
        const input = request.httpRequest && request.httpRequest.query || request.query || {};
        const limit = Number(input.limit || 50);
        if (!Number.isInteger(limit) || limit < 1 || limit > 500) throw new Error('AI ledger limit must be from 1 to 500');
        return limit;
    },

    /** Builds an allow-listed tenant query. */
    query: function (request, fields) {
        const input = request.httpRequest && request.httpRequest.query || request.query || {};
        const query = { tenantCode: String(request.tenant || request.tenantCode || '') };
        if (!query.tenantCode) throw new Error('AI ledger operation requires tenant identity');
        fields.forEach(field => {
            if (input[field] !== undefined && input[field] !== '') query[field] = input[field];
        });
        return query;
    },

    /** Lists exact effective-window budget accounts. */
    budgets: function (request) {
        return SERVICE.DefaultAiTokenLedgerRepositoryService.listBudgets(
            this.query(request, ['enterpriseCode', 'applicationCode', 'principalCode', 'profileCode',
                'providerCode', 'modelCode', 'period']), this.limit(request), request);
    },

    /** Lists bounded reservation lifecycle evidence. */
    reservations: function (request) {
        return SERVICE.DefaultAiTokenLedgerRepositoryService.listReservations(
            this.query(request, ['enterpriseCode', 'applicationCode', 'principalCode', 'state',
                'budgetCode']), this.limit(request), request);
    },

    /** Lists immutable normalized provider usage evidence. */
    usage: function (request) {
        return SERVICE.DefaultAiTokenLedgerRepositoryService.listUsage(
            this.query(request, ['enterpriseCode', 'applicationCode', 'principalCode', 'profileCode',
                'providerCode', 'modelCode', 'budgetCode']), this.limit(request), request);
    },

    /**
     * Returns a bounded, client-safe summary for the authenticated employee.
     * Provider identities, model identities, reservation references, and ledger
     * record identifiers intentionally remain undisclosed.
     */
    ownSummary: async function (request) {
        const tenantCode = String(request.tenant || request.tenantCode || '');
        if (!tenantCode) throw new Error('AI usage summary requires tenant identity');
        const principalCode = this.humanPrincipal(request);
        const repository = SERVICE.DefaultAiTokenLedgerRepositoryService;
        const configuration = SERVICE.DefaultAiTokenLedgerService.configuration(request);
        const costScale = configuration.tokenOptimization.costScale;
        const [budgetResponse, usageResponse] = await Promise.all([
            repository.listBudgets({ tenantCode: tenantCode, principalCode: principalCode }, 50, request),
            repository.listUsage({ tenantCode: tenantCode, principalCode: principalCode }, 500, request)
        ]);
        const values = response => response && Array.isArray(response.result) ? response.result : [];
        const budgets = values(budgetResponse).map(value => ({
            period: value.period,
            windowStart: value.windowStart,
            windowEnd: value.windowEnd,
            currencyCode: value.currencyCode,
            maximumTokens: Number(value.maximumTokens || 0),
            reservedTokens: Number(value.reservedTokens || 0),
            consumedTokens: Number(value.consumedTokens || 0),
            maximumCost: String(value.maximumCost || '0'),
            reservedCost: String(value.reservedCost || '0'),
            consumedCost: String(value.consumedCost || '0')
        }));
        const totals = new Map();
        values(usageResponse).forEach(value => {
            const currencyCode = String(value.currencyCode || '');
            if (!currencyCode) return;
            const current = totals.get(currencyCode) || { currencyCode: currencyCode, totalTokens: 0, cost: '0' };
            const tokens = Number(value.totalTokens || 0);
            if (!Number.isSafeInteger(tokens) || tokens < 0 ||
                !Number.isSafeInteger(current.totalTokens + tokens)) {
                throw new Error('AI usage token total exceeds safe integer boundary');
            }
            current.totalTokens += tokens;
            current.cost = economics.addExact(current.cost, String(value.cost || '0'), costScale);
            totals.set(currencyCode, current);
        });
        return {
            budgets: budgets,
            usageByCurrency: Array.from(totals.values()),
            usageRecordCount: values(usageResponse).length
        };
    },

    /** Lists persistent repair runs. */
    repairRuns: function (request) {
        return SERVICE.DefaultAiTokenLedgerRepositoryService.listRepairRuns(
            this.query(request, ['state', 'dryRun']), this.limit(request), request);
    },

    /** Lists persistent repair findings. */
    repairFindings: function (request) {
        return SERVICE.DefaultAiTokenLedgerRepositoryService.listRepairFindings(
            this.query(request, ['runCode', 'reservationCode', 'budgetCode', 'type', 'severity', 'state']),
            this.limit(request), request);
    },

    /** Updates one budget ceiling without allowing it below existing commitments. */
    updateBudget: async function (request) {
        const body = request.httpRequest && request.httpRequest.body || request.body || {};
        if (!body.budgetCode) throw new Error('AI budgetCode is required');
        const configuration = SERVICE.DefaultAiTokenLedgerService.configuration(request);
        const repository = SERVICE.DefaultAiTokenLedgerService.repository(request);
        const current = await repository.getBudget(body.budgetCode, request);
        if (!current || current.tenantCode !== String(request.tenant || request.tenantCode || '')) {
            throw new Error('AI token budget does not exist');
        }
        const maximumTokens = body.maximumTokens === undefined ? current.maximumTokens : Number(body.maximumTokens);
        const maximumCost = body.maximumCost === undefined ? current.maximumCost : String(body.maximumCost);
        if (!Number.isSafeInteger(maximumTokens) || maximumTokens < 0 ||
            !/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(maximumCost)) {
            throw new Error('AI budget ceilings require a safe integer token value and exact decimal cost');
        }
        const committedTokens = Number(current.reservedTokens || 0) + Number(current.consumedTokens || 0);
        const committedCost = economics.addExact(current.reservedCost || '0', current.consumedCost || '0',
            configuration.tokenOptimization.costScale);
        if (maximumTokens < committedTokens || economics.compareExact(maximumCost, committedCost) < 0) {
            throw new Error('AI budget ceiling cannot be lower than existing commitments');
        }
        const changed = await repository.compareAndSwapBudget(current.budgetCode, Number(current.revision || 0),
            { maximumTokens: maximumTokens, maximumCost: maximumCost }, request);
        if (changed !== 1) throw new Error('AI budget update lost its revision');
        return Object.assign({}, current, {
            maximumTokens: maximumTokens, maximumCost: maximumCost,
            revision: Number(current.revision || 0) + 1
        });
    },

    /** Runs bounded reservation expiry through the authoritative ledger lifecycle. */
    expire: function (request) {
        const body = request.httpRequest && request.httpRequest.body || request.body || {};
        return SERVICE.DefaultAiTokenLedgerService.expire({ at: body.at, context: request });
    },

    /** Runs one service-token-only bounded repair scan. */
    repairScan: function (request) {
        const body = request.httpRequest && request.httpRequest.body || request.body || {};
        let idempotencyKey = body.idempotencyKey;
        if (!idempotencyKey && body.scheduleCode) {
            const configuration = SERVICE.DefaultAiTokenLedgerService.configuration(request);
            const windowMs = configuration.ledger.repair.scheduleWindowMinutes * 60000;
            idempotencyKey = body.scheduleCode + ':' + Math.floor(Date.now() / windowMs);
        }
        return SERVICE.DefaultAiTokenLedgerRepairService.scan({
            idempotencyKey: idempotencyKey, dryRun: body.dryRun, context: request
        });
    },

    /** Reconciles uncertain usage from positive provider evidence. */
    reconcileUncertain: function (request) {
        const body = request.httpRequest && request.httpRequest.body || request.body || {};
        return SERVICE.DefaultAiTokenLedgerRepairService.reconcileUncertain({
            evidence: body, context: request
        });
    },

    /** Records human approval for deterministic repair. */
    approveRepairFinding: function (request) {
        const body = request.httpRequest && request.httpRequest.body || request.body || {};
        return SERVICE.DefaultAiTokenLedgerRepairService.approveFinding({
            findingCode: body.findingCode, note: body.note, context: request
        });
    },

    /** Applies one human-approved deterministic repair using service identity. */
    applyRepairFinding: function (request) {
        const body = request.httpRequest && request.httpRequest.body || request.body || {};
        return SERVICE.DefaultAiTokenLedgerRepairService.applyFinding({
            findingCode: body.findingCode, context: request
        });
    },

    /** Returns sanitized process-local repair diagnostics. */
    metrics: function (request) {
        return SERVICE.DefaultAiTokenLedgerMetricsService.snapshot(request);
    }
};
