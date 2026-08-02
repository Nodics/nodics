/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/service/stream/DefaultAiAssistantTurnCoordinatorService
 * @description Coordinates process-local live turn execution, subscribers, and cancellation over durable Assistant state.
 * @layer service
 * @owner aiAssistant
 * @override Distributed deployments may replace live fan-out while durable events remain the replay authority.
 */
const executions = new Map();
const subscribers = new Map();

function key(tenantCode, turnCode) {
    return tenantCode + ':' + turnCode;
}

module.exports = {
    /** Publishes one already-persisted event to current process-local subscribers. */
    publish: async function (event) {
        const listeners = subscribers.get(key(event.tenantCode, event.turnCode));
        if (!listeners) return false;
        await Promise.all(Array.from(listeners).map(listener => Promise.resolve(listener(event))));
        return true;
    },

    /** Adds one live subscriber and returns an idempotent unsubscribe function. */
    subscribe: function (tenantCode, turnCode, listener) {
        const executionKey = key(tenantCode, turnCode);
        const listeners = subscribers.get(executionKey) || new Set();
        listeners.add(listener);
        subscribers.set(executionKey, listeners);
        return () => {
            const current = subscribers.get(executionKey);
            if (!current) return;
            current.delete(listener);
            if (!current.size) subscribers.delete(executionKey);
        };
    },

    /** Accepts a turn durably, starts background orchestration, and returns immediately. */
    start: async function (request, runtime) {
        const coordinator = this;
        runtime.eventPublisher = event => coordinator.publish(event);
        runtime.streamingProviderEvents = true;
        const prepared = await SERVICE.DefaultAiAssistantTurnOrchestrationService.prepare(request, runtime);
        if (prepared.turn.state !== 'ACCEPTED') return prepared;
        const executionKey = key(prepared.identity.tenantCode, prepared.turn.turnCode);
        if (executions.has(executionKey)) return prepared;
        const controller = new AbortController();
        request.signal = controller.signal;
        request.executionController = controller;
        const execution = {
            controller: controller,
            tenantCode: prepared.identity.tenantCode,
            principalCode: prepared.identity.principalCode,
            conversationCode: prepared.conversation.conversationCode,
            turnCode: prepared.turn.turnCode
        };
        executions.set(executionKey, execution);
        Promise.resolve().then(() =>
            SERVICE.DefaultAiAssistantTurnOrchestrationService.executePrepared(prepared, request, runtime)
        ).catch(() => undefined).finally(() => executions.delete(executionKey));
        return prepared;
    },

    /** Requests cancellation only for the matching authenticated process-local execution. */
    cancel: function (tenantCode, principalCode, conversationCode, turnCode, reason) {
        const execution = executions.get(key(tenantCode, turnCode));
        if (!execution || execution.principalCode !== principalCode ||
            execution.conversationCode !== conversationCode) return false;
        execution.controller.abort(new Error(reason || 'Employee requested cancellation'));
        return true;
    },

    /** Returns sanitized process-local activity for focused diagnostics and tests. */
    isActive: function (tenantCode, turnCode) {
        return executions.has(key(tenantCode, turnCode));
    }
};
