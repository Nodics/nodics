/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantTurnExecutionLeaseContract
 * @description Proves single-winner execution ownership, renewal, cache mirroring, and fail-safe abandoned-turn recovery.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const defaults = require('../config/properties').aiAssistant;
const leaseService = require('../src/service/turn/defaultAiAssistantTurnExecutionLeaseService');
const recoveryService = require('../src/service/turn/defaultAiAssistantTurnRecoveryService');

const turns = [{
    turnCode: 'turn-1', conversationCode: 'conversation-1', tenantCode: 'tenant-a',
    principalCode: 'employee-a', state: 'ACCEPTED', acceptedAt: new Date(0)
}, {
    turnCode: 'turn-2', conversationCode: 'conversation-1', tenantCode: 'tenant-a',
    principalCode: 'employee-a', state: 'PROCESSING', executionOwner: 'dead-node',
    executionPhase: 'PROVIDER', acceptedAt: new Date(0), leaseExpiresAt: new Date(1)
}];
const events = [];

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
const cacheWrites = [];
const runtime = {
    configuration: defaults,
    services: { turns: turnService, events: eventService },
    executionCache: { put: input => { cacheWrites.push(input); return Promise.resolve(true); } }
};
const request = { tenant: 'tenant-a', authData: { principalType: 'service' }, body: { limit: 10 } };

Promise.all([
    leaseService.claimAccepted(turns[0], request, runtime, 'node-a'),
    leaseService.claimAccepted(turns[0], request, runtime, 'node-b')
]).then(async claims => {
    assert.strictEqual(claims.filter(Boolean).length, 1, 'only one runtime may own an accepted turn');
    const lease = claims.find(Boolean);
    assert.strictEqual(turns[0].executionOwner, lease.owner);
    assert.strictEqual(cacheWrites[0].moduleName, 'aiAssistant');
    assert.strictEqual(cacheWrites[0].channelName, 'executionLease');
    await leaseService.renew(lease, request, runtime, 'PROVIDER');
    assert.strictEqual(turns[0].executionPhase, 'PROVIDER');
    turns[0].executionPhase = 'PREPARING';
    turns[0].leaseExpiresAt = new Date(1);
    const result = await recoveryService.reconcile(
        Object.assign({}, request, { at: '2026-01-01T00:00:00.000Z' }), runtime
    );
    assert.strictEqual(result.recovered, 2);
    assert.strictEqual(turns[0].failureCode, 'AI_ASSISTANT_RECOVERY_RETRY_REQUIRED');
    assert.strictEqual(turns[1].failureCode, 'AI_ASSISTANT_PROVIDER_OUTCOME_UNCERTAIN');
    assert(events.some(event => event.data.retrySafe === true));
    assert(events.some(event => event.data.retrySafe === false));
    const empty = await recoveryService.reconcile(
        Object.assign({}, request, { at: '2026-01-01T00:00:00.000Z' }), runtime
    );
    assert.strictEqual(empty.scanned, 0);
    assert.strictEqual(empty.recovered, 0);
    console.log('AI Assistant distributed execution lease contract validated');
}).catch(error => {
    console.error(error);
    process.exitCode = 1;
});
