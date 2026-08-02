/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/src/service/token/defaultAiTokenLedgerRepairService
 * @description Scans stale ledger transitions, repairs deterministic state, and reconciles uncertain usage only from provider evidence.
 * @layer service
 * @owner aiProviders
 * @override Projects may add evidence adapters or approval workflows while preserving service identity, dry-run, bounded scans, and immutable findings.
 */
const crypto = require('crypto');
const economics = require('./defaultAiTokenEconomicsService');

function hash(value) {
    return crypto.createHash('sha256').update(String(value)).digest('hex');
}

module.exports = {
    /** Requires the cron/module service identity for scans and repairs. */
    authorize: function (context) {
        if (!context || !context.authData || context.authData.tokenType !== 'service') {
            throw new Error('AI ledger repair requires service identity');
        }
        if (!context.tenant && !context.tenantCode) throw new Error('AI ledger repair requires tenant identity');
        return true;
    },

    /** Resolves effective repair policy through the ledger configuration authority. */
    policy: function (context) {
        const configuration = SERVICE.DefaultAiTokenLedgerService.configuration(context);
        return { configuration: configuration, repair: configuration.ledger.repair };
    },

    /** Creates deterministic immutable finding evidence. */
    finding: async function (run, reservation, type, repairable, evidenceRequired, context) {
        const repository = SERVICE.DefaultAiTokenLedgerService.repository(context);
        const findingCode = hash(run.runCode + '|' + reservation.reservationCode + '|' + type);
        let existing = await repository.getRepairFinding(findingCode, context);
        if (existing) return existing;
        const model = {
            code: findingCode, active: true, findingCode: findingCode, runCode: run.runCode,
            tenantCode: String(context.tenant || context.tenantCode),
            reservationCode: reservation.reservationCode, budgetCode: reservation.budgetCode,
            type: type, severity: evidenceRequired ? 'CRITICAL' : 'HIGH', state: 'OPEN',
            expected: { terminalOrGovernedState: true },
            actual: { state: reservation.state, revision: reservation.revision, updatedAt: reservation.updatedAt },
            repairable: repairable, evidenceRequired: evidenceRequired
        };
        await repository.createRepairFinding(model, context);
        return model;
    },

    /** Reconstructs exact budget counters from reservation and immutable usage evidence. */
    rebuildBudget: async function (budgetCode, context) {
        const policy = this.policy(context);
        const repository = SERVICE.DefaultAiTokenLedgerService.repository(context);
        const limit = policy.repair.maximumFindings;
        for (let attempt = 0; attempt < policy.configuration.ledger.maximumCompareAndSwapAttempts; attempt += 1) {
            const budget = await repository.getBudget(budgetCode, context);
            if (!budget) throw new Error('AI repair budget does not exist');
            const reservations = await repository.listBudgetReservations(budgetCode, limit, context);
            const usage = await repository.listBudgetUsage(budgetCode, limit, context);
            if (reservations.length >= limit || usage.length >= limit) {
                throw new Error('AI repair budget evidence boundary exceeded');
            }
            const activeStates = ['RESERVED', 'RECONCILING', 'UNCERTAIN'];
            const reserved = reservations.filter(value => activeStates.includes(value.state));
            const reservedTokens = reserved.reduce((total, value) => total + Number(value.reservedTokens || 0), 0);
            const consumedTokens = usage.reduce((total, value) => total + Number(value.totalTokens || 0), 0);
            let reservedCost = '0.00000000';
            let consumedCost = '0.00000000';
            reserved.forEach(value => {
                reservedCost = economics.addExact(reservedCost, value.reservedCost || '0',
                    policy.configuration.tokenOptimization.costScale);
            });
            usage.forEach(value => {
                consumedCost = economics.addExact(consumedCost, value.cost || '0',
                    policy.configuration.tokenOptimization.costScale);
            });
            const changed = await repository.compareAndSwapBudget(budgetCode, Number(budget.revision || 0), {
                reservedTokens: reservedTokens, consumedTokens: consumedTokens,
                reservedCost: reservedCost, consumedCost: consumedCost
            }, context);
            if (changed === 1) return true;
        }
        throw new Error('AI repair budget reconstruction concurrency retry limit exceeded');
    },

    /** Rebuilds every account referenced by a reservation in deterministic order. */
    rebuildReservationBudgets: async function (reservation, context) {
        const codes = Array.from(new Set(reservation.budgetCodes || [reservation.budgetCode])).sort();
        for (const budgetCode of codes) await this.rebuildBudget(budgetCode, context);
        return true;
    },

    /** Repairs deterministic interrupted transitions; uncertain usage is never released here. */
    repairFinding: async function (finding, reservation, context) {
        const repository = SERVICE.DefaultAiTokenLedgerService.repository(context);
        let targetState;
        if (reservation.state === 'RELEASING') {
            targetState = 'RELEASED';
        } else if (reservation.state === 'RECONCILING') {
            targetState = await repository.getUsage(reservation.reservationCode, context) ?
                'RECONCILED' : 'UNCERTAIN';
        } else {
            return false;
        }
        const changed = await repository.updateReservation(reservation.reservationCode,
            Number(reservation.revision || 0), reservation.state, {
                state: targetState, terminalAt: ['RELEASED', 'RECONCILED'].includes(targetState) ? new Date() : undefined,
                failureCode: targetState === 'UNCERTAIN' ? 'REPAIR_REQUIRES_PROVIDER_EVIDENCE' : reservation.failureCode
            }, context);
        if (changed !== 1) throw new Error('AI repair reservation transition lost its revision');
        await this.rebuildReservationBudgets(reservation, context);
        await repository.updateRepairFinding(finding.findingCode, finding.state, {
            state: targetState === 'UNCERTAIN' ? 'EVIDENCE_REQUIRED' : 'RESOLVED',
            repairMode: 'AUTOMATIC_DETERMINISTIC', repairedBy: 'SERVICE',
            repairedAt: new Date(), resolutionNote: 'Recovered interrupted ' + reservation.state + ' transition'
        }, context);
        SERVICE.DefaultAiTokenLedgerMetricsService.record('repair', targetState, context);
        return true;
    },

    /** Runs one bounded idempotent dry-first scan. */
    scan: async function (input) {
        const context = input.context || {};
        this.authorize(context);
        const policy = this.policy(context);
        const repository = SERVICE.DefaultAiTokenLedgerService.repository(context);
        const idempotencyKey = String(input.idempotencyKey || '');
        if (idempotencyKey.length < 8) throw new Error('AI repair scan requires an idempotency key');
        const tenantCode = String(context.tenant || context.tenantCode);
        const runCode = hash(tenantCode + '|' + idempotencyKey);
        let run = await repository.getRepairRun(runCode, context);
        if (run && run.state === 'COMPLETED') return run;
        const dryRun = input.dryRun === undefined ? policy.repair.dryRunDefault !== false : input.dryRun === true;
        if (!run) {
            run = {
                code: runCode, active: true, runCode: runCode, idempotencyKey: idempotencyKey,
                tenantCode: tenantCode, state: 'RUNNING', dryRun: dryRun,
                scannedCount: 0, findingCount: 0, repairedCount: 0, startedAt: new Date()
            };
            await repository.createRepairRun(run, context);
        } else if (run.dryRun !== dryRun) {
            throw new Error('AI repair idempotency key cannot change dry-run mode');
        }
        const cutoff = new Date(Date.now() - policy.repair.staleTransitionSeconds * 1000);
        const offset = dryRun ? Number(run.scannedCount || 0) : 0;
        const candidates = await repository.findRepairCandidates(cutoff, policy.repair.batchSize, offset, context);
        if (Number(run.findingCount || 0) + candidates.length > policy.repair.maximumFindings) {
            throw new Error('AI repair finding boundary exceeded');
        }
        const findings = [];
        let repairedCount = 0;
        for (const reservation of candidates) {
            const uncertain = reservation.state === 'UNCERTAIN';
            const finding = await this.finding(run, reservation,
                uncertain ? 'UNCERTAIN_PROVIDER_USAGE' : 'STALE_' + reservation.state,
                !uncertain, uncertain, context);
            findings.push(finding);
            if (!dryRun && !uncertain && policy.repair.deterministicRepairApprovalMode === 'AUTOMATIC') {
                if (await this.repairFinding(finding, reservation, context)) repairedCount += 1;
            }
        }
        const complete = candidates.length < policy.repair.batchSize;
        const patch = {
            state: complete ? 'COMPLETED' : 'PARTIAL',
            scannedCount: Number(run.scannedCount || 0) + candidates.length,
            findingCount: Number(run.findingCount || 0) + findings.length,
            repairedCount: Number(run.repairedCount || 0) + repairedCount,
            completedAt: complete ? new Date() : undefined
        };
        await repository.updateRepairRun(runCode, patch, context);
        SERVICE.DefaultAiTokenLedgerMetricsService.record('scan', patch.state, context);
        return Object.assign({}, run, patch, { findings: findings });
    },

    /** Records human approval without allowing a human identity to execute repair. */
    approveFinding: async function (input) {
        const context = input.context || {};
        if (!context.authData || context.authData.tokenType === 'service') {
            throw new Error('AI ledger repair approval requires human identity');
        }
        const repository = SERVICE.DefaultAiTokenLedgerService.repository(context);
        const finding = await repository.getRepairFinding(input.findingCode, context);
        if (!finding || finding.tenantCode !== String(context.tenant || context.tenantCode || '') ||
            finding.repairable !== true || finding.evidenceRequired === true || finding.state !== 'OPEN') {
            throw new Error('AI ledger repair finding is not available for approval');
        }
        await repository.updateRepairFinding(finding.findingCode, 'OPEN', {
            state: 'APPROVED', repairMode: 'MANUAL',
            approvedBy: context.authData.principalId || context.authData.code,
            approvedAt: new Date(),
            resolutionNote: input.note
        }, context);
        return Object.assign({}, finding, { state: 'APPROVED', repairMode: 'MANUAL' });
    },

    /** Executes one approved deterministic finding using service identity. */
    applyFinding: async function (input) {
        const context = input.context || {};
        this.authorize(context);
        const repository = SERVICE.DefaultAiTokenLedgerService.repository(context);
        const finding = await repository.getRepairFinding(input.findingCode, context);
        if (!finding || finding.tenantCode !== String(context.tenant || context.tenantCode || '') ||
            finding.state !== 'APPROVED' || finding.repairable !== true || finding.evidenceRequired === true) {
            throw new Error('AI ledger repair finding is not approved and repairable');
        }
        const reservation = await repository.getReservation(finding.reservationCode, context);
        if (!reservation) throw new Error('AI ledger repair reservation does not exist');
        return this.repairFinding(finding, reservation, context);
    },

    /** Reconciles uncertain usage only from positive provider usage evidence. */
    reconcileUncertain: async function (input) {
        const context = input.context || {};
        this.authorize(context);
        const evidence = input.evidence || {};
        if (!evidence.reservationId || !evidence.providerRequestId || !evidence.usage ||
            evidence.evidenceSource !== 'PROVIDER') {
            throw new Error('AI uncertain reconciliation requires positive provider usage evidence');
        }
        const repository = SERVICE.DefaultAiTokenLedgerService.repository(context);
        const reservation = await repository.getReservation(evidence.reservationId, context);
        if (!reservation || reservation.state !== 'UNCERTAIN') {
            throw new Error('AI uncertain reservation is unavailable');
        }
        const configuration = this.policy(context).configuration;
        const rates = ((configuration.pricing || {}).models || {})[
            reservation.tokenPlan.provider + ':' + reservation.tokenPlan.model
        ];
        if (!rates || rates.revision !== reservation.tokenPlan.pricingRevision) {
            throw new Error('AI uncertain reconciliation pricing revision is unavailable');
        }
        const actualCost = economics.calculateCost(evidence.usage, rates,
            configuration.tokenOptimization.costScale);
        const evidenceContext = Object.assign({}, context, {
            providerRequestId: evidence.providerRequestId,
            evidenceSource: evidence.evidenceSource
        });
        await SERVICE.DefaultAiTokenLedgerService.reconcile({
            reconciliation: {
                reservationId: reservation.reservationCode, actualUsage: evidence.usage,
                actualCost: actualCost, currencyCode: reservation.currencyCode,
                state: economics.compareExact(actualCost, reservation.reservedCost) > 0 ? 'OVERAGE' : 'RECONCILED'
            },
            context: evidenceContext
        });
        SERVICE.DefaultAiTokenLedgerMetricsService.record('uncertainReconciliation', 'RECONCILED', context);
        return {
            reservationId: reservation.reservationCode, providerRequestId: evidence.providerRequestId,
            state: 'RECONCILED', actualCost: actualCost, currencyCode: reservation.currencyCode
        };
    }
};
