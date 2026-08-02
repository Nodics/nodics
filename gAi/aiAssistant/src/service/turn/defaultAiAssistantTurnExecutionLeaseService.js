/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/service/turn/DefaultAiAssistantTurnExecutionLeaseService
 * @description Owns durable compare-and-set Assistant execution leases and mirrors them into nCache for fast distributed visibility.
 * @layer service
 * @owner aiAssistant
 * @override Projects may replace scheduling while preserving durable ownership, bounded leases, and uncertain-provider fail-safe recovery.
 */
const crypto = require('crypto');
const telemetry = require('../observability/defaultAiAssistantExecutionTelemetryService');

function affected(response) {
    const result = response && response.result !== undefined ? response.result : response;
    if (!result) return 0;
    if (Array.isArray(result)) return result.length;
    if (typeof result.modifiedCount === 'number') return result.modifiedCount;
    if (typeof result.nModified === 'number') return result.nModified;
    if (typeof result.matchedCount === 'number') return result.matchedCount;
    if (typeof result.n === 'number') return result.n;
    return result.result ? affected(result.result) : 0;
}

module.exports = {
    /** Creates a runtime-unique owner identity without introducing a configured identity authority. */
    owner: function () {
        const nodeId = typeof CONFIG !== 'undefined' && CONFIG.get('nodeId') || 'node';
        return String(nodeId) + ':' + process.pid + ':' + crypto.randomUUID();
    },

    /** Resolves the generated persistence service and configured execution policy. */
    dependencies: function (runtime) {
        const configuration = runtime.configuration.execution || {};
        const turns = runtime.services && runtime.services.turns ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultAssistantTurnService);
        if (!turns) throw new Error('AI Assistant turn persistence is unavailable');
        return {
            turns: turns,
            cache: runtime.executionCache || (typeof SERVICE !== 'undefined' && SERVICE.DefaultCacheService),
            leaseDurationMs: Number(configuration.leaseDurationMs || 120000),
            heartbeatIntervalMs: Number(configuration.heartbeatIntervalMs || 30000)
        };
    },

    /** Mirrors lease state into the configured nCache authority; persistence remains authoritative. */
    mirror: async function (lease, dependencies) {
        const cache = dependencies.cache;
        if (!cache || typeof cache.put !== 'function') {
            telemetry.record('cacheMirrorFailures');
            return false;
        }
        try {
            await cache.put({
                moduleName: 'aiAssistant', tenant: lease.tenantCode, channelName: 'executionLease',
                key: lease.turnCode, value: {
                    owner: lease.owner, phase: lease.phase,
                    leaseExpiresAt: lease.leaseExpiresAt.toISOString()
                },
                ttl: Math.max(1, Math.ceil(dependencies.leaseDurationMs / 1000))
            });
            return true;
        } catch (error) {
            telemetry.record('cacheMirrorFailures');
            return false;
        }
    },

    /** Atomically claims an accepted turn; a zero affected count means another runtime won. */
    claimAccepted: async function (turn, request, runtime, owner) {
        telemetry.record('claimsAttempted');
        const dependencies = this.dependencies(runtime);
        const now = new Date();
        const lease = {
            owner: owner || this.owner(), tenantCode: turn.tenantCode, turnCode: turn.turnCode,
            phase: 'PREPARING', leaseExpiresAt: new Date(now.getTime() + dependencies.leaseDurationMs)
        };
        const response = await dependencies.turns.update({
            tenant: turn.tenantCode, authData: request.authData,
            query: { turnCode: turn.turnCode, tenantCode: turn.tenantCode, state: 'ACCEPTED' },
            model: {
                state: 'PROCESSING', executionOwner: lease.owner, executionPhase: lease.phase,
                heartbeatAt: now, leaseExpiresAt: lease.leaseExpiresAt
            }
        });
        if (affected(response) !== 1) {
            telemetry.record('claimConflicts');
            return undefined;
        }
        telemetry.record('claimsAcquired');
        await this.mirror(lease, dependencies);
        return lease;
    },

    /** Renews only the lease still owned by this runtime and optionally advances its phase. */
    renew: async function (lease, request, runtime, phase) {
        const dependencies = this.dependencies(runtime);
        const now = new Date();
        const nextPhase = phase || lease.phase;
        const expiresAt = new Date(now.getTime() + dependencies.leaseDurationMs);
        let response = await dependencies.turns.update({
            tenant: lease.tenantCode, authData: request.authData,
            query: {
                turnCode: lease.turnCode, tenantCode: lease.tenantCode,
                state: 'PROCESSING', executionOwner: lease.owner
            },
            model: { executionPhase: nextPhase, heartbeatAt: now, leaseExpiresAt: expiresAt }
        });
        if (affected(response) !== 1) {
            response = await dependencies.turns.update({
                tenant: lease.tenantCode, authData: request.authData,
                query: {
                    turnCode: lease.turnCode, tenantCode: lease.tenantCode,
                    state: 'CANCELLATION_REQUESTED', executionOwner: lease.owner
                },
                model: { executionPhase: nextPhase, heartbeatAt: now, leaseExpiresAt: expiresAt }
            });
        }
        if (affected(response) !== 1) throw new Error('AI Assistant execution lease ownership was lost');
        telemetry.record('leaseRenewals');
        lease.phase = nextPhase;
        lease.leaseExpiresAt = expiresAt;
        await this.mirror(lease, dependencies);
        const current = await this.current(lease, request, runtime);
        lease.cancellationRequested = current && current.state === 'CANCELLATION_REQUESTED';
        lease.cancellationReason = current && current.cancellationReason;
        return lease;
    },

    /** Loads the authoritative owned turn after a lease transition. */
    current: async function (lease, request, runtime) {
        const dependencies = this.dependencies(runtime);
        const response = await dependencies.turns.get({
            tenant: lease.tenantCode, authData: request.authData,
            query: {
                turnCode: lease.turnCode, tenantCode: lease.tenantCode,
                executionOwner: lease.owner
            },
            searchOptions: { pageSize: 1, pageNumber: 1 }
        });
        return response && Array.isArray(response.result) ? response.result[0] : undefined;
    },

    /** Starts bounded renewal and exposes an idempotent stop operation. */
    heartbeat: function (lease, request, runtime, onCancellationRequested) {
        const dependencies = this.dependencies(runtime);
        let stopped = false;
        let failure;
        const timer = setInterval(() => {
            if (stopped) return;
            this.renew(lease, request, runtime).then(currentLease => {
                if (currentLease.cancellationRequested && typeof onCancellationRequested === 'function') {
                    onCancellationRequested(currentLease.cancellationReason);
                }
            }).catch(error => {
                telemetry.record('heartbeatFailures', 'lastHeartbeatFailureAt');
                failure = error;
                stopped = true;
                clearInterval(timer);
            });
        }, dependencies.heartbeatIntervalMs);
        if (typeof timer.unref === 'function') timer.unref();
        return {
            stop: () => { stopped = true; clearInterval(timer); },
            assertOwned: () => { if (failure) throw failure; }
        };
    }
};
