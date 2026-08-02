/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantDistributedCancellationContract
 * @description Verifies durable ownership, idempotency, heartbeat observation, redaction, and abandoned cancellation recovery.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const defaults = require('../config/properties').aiAssistant;
const conversationService = require('../src/service/conversation/defaultAiAssistantConversationService');
const leaseService = require('../src/service/turn/defaultAiAssistantTurnExecutionLeaseService');
const recoveryService = require('../src/service/turn/defaultAiAssistantTurnRecoveryService');

const turns = [{
    turnCode: 'turn-cancel', conversationCode: 'conversation-a', tenantCode: 'tenant-a',
    principalCode: 'employee-a', state: 'PROCESSING', executionOwner: 'node-a',
    executionPhase: 'PROVIDER', leaseExpiresAt: new Date(Date.now() + 1000)
}];
const events = [];
const conversations = [{
    conversationCode: 'conversation-a', tenantCode: 'tenant-a',
    principalCode: 'employee-a', state: 'ACTIVE'
}];

function matches(value, query) {
    return Object.keys(query || {}).every(key => {
        if (key === '$or') return query.$or.some(option => matches(value, option));
        if (query[key] && query[key].$lte !== undefined) return value[key] <= query[key].$lte;
        if (query[key] instanceof Date) return value[key] instanceof Date &&
            value[key].getTime() === query[key].getTime();
        return value[key] === query[key];
    });
}

const turnService = {
    get: input => Promise.resolve({ result: turns.filter(turn => matches(turn, input.query)) }),
    update: input => {
        const turn = turns.find(value => matches(value, input.query));
        if (turn) Object.assign(turn, input.model);
        return Promise.resolve({ result: { modifiedCount: turn ? 1 : 0 } });
    }
};
const eventService = {
    get: input => Promise.resolve({ result: events.filter(event => matches(event, input.query)) }),
    save: input => { events.push(input.model); return Promise.resolve({ result: [input.model] }); }
};
const conversationStoreService = {
    get: input => Promise.resolve({
        result: conversations.filter(conversation => matches(conversation, input.query))
    })
};
const runtime = {
    configuration: Object.assign({}, defaults, {
        execution: Object.assign({}, defaults.execution, {
            heartbeatIntervalMs: 10, leaseDurationMs: 100
        })
    }),
    services: {
        conversations: conversationStoreService, turns: turnService,
        events: eventService
    },
    executionCache: { put: () => Promise.resolve(true) }
};
const context = {
    configuration: runtime.configuration,
    identity: { tenantCode: 'tenant-a', principalCode: 'employee-a' },
    services: runtime.services
};
const request = {
    tenant: 'tenant-a',
    authData: { principalType: 'human', loginId: 'employee-a' },
    reason: 'raw private reason must not be persisted'
};

(async function run() {
    const requested = await conversationService.requestCancellation(
        'conversation-a', 'turn-cancel', request, context
    );
    assert.strictEqual(requested.state, 'CANCELLATION_REQUESTED');
    assert.strictEqual(requested.cancellationRequestedBy, 'employee-a');
    assert.strictEqual(requested.cancellationReason, 'EMPLOYEE_REQUEST');
    assert.strictEqual(JSON.stringify(requested).includes('raw private reason'), false);

    const replay = await conversationService.requestCancellation(
        'conversation-a', 'turn-cancel', request, context
    );
    assert.strictEqual(replay.state, 'CANCELLATION_REQUESTED');

    await assert.rejects(conversationService.requestCancellation(
        'conversation-a', 'turn-cancel', request,
        Object.assign({}, context, {
            identity: { tenantCode: 'tenant-a', principalCode: 'employee-b' }
        })
    ), /not found for authenticated principal/);

    let observed = false;
    const lease = {
        owner: 'node-a', tenantCode: 'tenant-a', turnCode: 'turn-cancel',
        phase: 'PROVIDER', leaseExpiresAt: turns[0].leaseExpiresAt
    };
    const heartbeat = leaseService.heartbeat(lease, request, runtime, () => { observed = true; });
    await new Promise(resolve => setTimeout(resolve, 35));
    heartbeat.stop();
    assert.strictEqual(observed, true, 'lease owner must observe durable cancellation');

    turns[0].leaseExpiresAt = new Date(1);
    const recovery = await recoveryService.reconcile(
        Object.assign({}, request, { at: '2026-01-01T00:00:00.000Z', body: {} }), runtime
    );
    assert.strictEqual(recovery.recovered, 1);
    assert.strictEqual(turns[0].state, 'CANCELLED');
    assert.strictEqual(events.filter(event => event.eventType === 'CANCELLED').length, 1);
    console.log('AI Assistant distributed cancellation contract validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
