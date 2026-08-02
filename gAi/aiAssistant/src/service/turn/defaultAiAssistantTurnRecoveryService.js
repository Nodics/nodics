/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/service/turn/DefaultAiAssistantTurnRecoveryService
 * @description Reconciles bounded abandoned Assistant turns without replaying provider calls whose outcome may be uncertain.
 * @layer service
 * @owner aiAssistant
 * @override Schedulers may invoke this service differently but must retain bounded, tenant-scoped, fail-safe reconciliation.
 */
const crypto = require('crypto');
const conversationService = require('../conversation/defaultAiAssistantConversationService');
const telemetry = require('../observability/defaultAiAssistantExecutionTelemetryService');

function items(response) {
    return response && Array.isArray(response.result) ? response.result : [];
}

function affected(response) {
    const result = response && response.result !== undefined ? response.result : response;
    if (!result) return 0;
    if (Array.isArray(result)) return result.length;
    return Number(result.modifiedCount || result.nModified || result.matchedCount || result.n || 0);
}

module.exports = {
    /** Returns the failure code that preserves honest provider-outcome semantics. */
    failureCode: function (turn) {
        return turn.executionPhase === 'PROVIDER' ?
            'AI_ASSISTANT_PROVIDER_OUTCOME_UNCERTAIN' :
            'AI_ASSISTANT_RECOVERY_RETRY_REQUIRED';
    },

    /** Claims and terminalizes one abandoned turn using its last durable lease evidence. */
    reconcileTurn: async function (turn, request, context) {
        const services = conversationService.services(context);
        const recoveryOwner = 'recovery:' + crypto.randomUUID();
        const query = {
            turnCode: turn.turnCode, tenantCode: turn.tenantCode, state: turn.state
        };
        if (['PROCESSING', 'CANCELLATION_REQUESTED'].includes(turn.state)) {
            query.executionOwner = turn.executionOwner;
            query.leaseExpiresAt = turn.leaseExpiresAt;
        }
        const failureCode = this.failureCode(turn);
        const cancellation = turn.state === 'CANCELLATION_REQUESTED';
        const response = await services.turns.update({
            tenant: turn.tenantCode, authData: request.authData, query: query,
            model: {
                state: cancellation ? 'CANCELLED' : 'FAILED',
                executionOwner: recoveryOwner, executionPhase: 'RECOVERED',
                failureCode: cancellation ? undefined : failureCode,
                heartbeatAt: new Date(), completedAt: new Date()
            }
        });
        if (affected(response) !== 1) {
            telemetry.record('recoveryClaimConflicts');
            return { turnCode: turn.turnCode, recovered: false, reason: 'CLAIM_LOST' };
        }
        telemetry.record('recoverySucceeded');
        if (!cancellation) {
            telemetry.record(failureCode === 'AI_ASSISTANT_PROVIDER_OUTCOME_UNCERTAIN' ?
                'uncertainProviderRecoveries' : 'retryRequiredRecoveries');
        } else {
            telemetry.record('cancellationRecoveries');
        }
        await conversationService.appendEvent(turn, cancellation ? 'CANCELLED' : 'FAILED', {
            code: cancellation ? 'EMPLOYEE_CANCELLED' : failureCode, recovery: true,
            retrySafe: !cancellation && failureCode !== 'AI_ASSISTANT_PROVIDER_OUTCOME_UNCERTAIN'
        }, request, context);
        return {
            turnCode: turn.turnCode, recovered: true,
            state: cancellation ? 'CANCELLED' : 'FAILED',
            failureCode: cancellation ? undefined : failureCode
        };
    },

    /** Reconciles one bounded tenant-scoped batch selected from persisted turn authority. */
    reconcile: async function (request, runtime) {
        const configuration = runtime.configuration;
        const execution = configuration.execution;
        const services = runtime.services || {};
        const turns = services.turns || SERVICE.DefaultAssistantTurnService;
        const now = request.at ? new Date(request.at) : new Date();
        if (Number.isNaN(now.getTime())) throw new Error('AI Assistant recovery time is invalid');
        const acceptedBefore = new Date(now.getTime() - execution.acceptedRecoveryAgeMs);
        const limit = Math.min(execution.recoveryBatchSize,
            Math.max(1, Number((request.body || {}).limit) || execution.recoveryBatchSize));
        const tenantCode = request.tenant || request.tenantCode;
        if (!tenantCode) throw new Error('AI Assistant recovery requires tenant identity');
        const response = await turns.get({
            tenant: tenantCode, authData: request.authData,
            query: {
                tenantCode: tenantCode,
                $or: [
                    { state: 'ACCEPTED', acceptedAt: { $lte: acceptedBefore } },
                    { state: 'PROCESSING', leaseExpiresAt: { $lte: now } },
                    { state: 'CANCELLATION_REQUESTED', leaseExpiresAt: { $lte: now } }
                ]
            },
            searchOptions: { pageSize: limit, pageNumber: 1, sort: { acceptedAt: 1 } }
        });
        const candidates = items(response).slice(0, limit);
        telemetry.add('recoveryScanned', candidates.length);
        const results = [];
        for (const turn of candidates) {
            const context = {
                configuration: configuration,
                identity: { tenantCode: tenantCode, principalCode: turn.principalCode },
                services: runtime.services
            };
            results.push(await this.reconcileTurn(turn, request, context));
        }
        const result = {
            scanned: candidates.length,
            recovered: results.filter(result => result.recovered).length,
            results: results
        };
        telemetry.metrics().lastRecoveryAt = new Date().toISOString();
        return result;
    }
};
