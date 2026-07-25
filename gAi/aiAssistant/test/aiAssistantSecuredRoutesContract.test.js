/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantSecuredRoutesContract
 * @description Verifies secured route metadata, employee ownership, bounded replay, and accepted-turn cancellation.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const routes = require('../src/router/routers').aiAssistant;
const defaults = require('../config/properties').aiAssistant;
const conversationService = require('../src/service/conversation/defaultAiAssistantConversationService');

const operations = Object.values(routes).flatMap(group => Object.values(group));
assert.strictEqual(operations.length, 13);
operations.filter(route => ![routes.turns.recover, routes.operations.diagnostics].includes(route)).forEach(route => {
    assert.strictEqual(route.secured, true);
    assert.deepStrictEqual(route.accessGroups, ['userGroup']);
    assert.strictEqual(route.apiExposure, 'aiAssistant');
    assert(route.permission && route.permission.startsWith('ai.assistant.'));
    assert.strictEqual(route.controller, 'DefaultAiAssistantController');
});
assert.strictEqual(routes.turns.recover.secured, true);
assert.strictEqual(routes.turns.recover.apiExposure, 'moduleInternal');
assert.strictEqual(routes.turns.recover.permissionConfig, 'authSecurity.internalToken.routePermission');
assert.strictEqual(routes.operations.diagnostics.apiExposure, 'aiOperations');
assert.strictEqual(routes.operations.diagnostics.permission, 'ai.assistant.operations.read');
assert.strictEqual(routes.turns.submit.requestBody.content['application/json'].schema.additionalProperties, false);
assert.strictEqual(
    routes.turns.submit.requestBody.content['application/json'].schema.properties.promptCode,
    undefined,
    'Browser callers must not choose the governed prompt'
);
assert.strictEqual(routes.turns.replayEvents.method, 'GET');
assert.strictEqual(routes.turns.stream.responseHandler, 'aiAssistantSseResponseHandler');
assert.strictEqual(routes.turns.cancel.method, 'POST');

const store = {
    conversations: [
        { conversationCode: 'conversation-owned', tenantCode: 'tenant-a', principalCode: 'employee-a', state: 'ACTIVE' },
        { conversationCode: 'conversation-other', tenantCode: 'tenant-a', principalCode: 'employee-b', state: 'ACTIVE' }
    ],
    turns: [
        {
            turnCode: 'turn-owned', conversationCode: 'conversation-owned',
            tenantCode: 'tenant-a', principalCode: 'employee-a', state: 'ACCEPTED'
        }
    ],
    events: [
        {
            eventCode: 'turn-owned-1', conversationCode: 'conversation-owned',
            turnCode: 'turn-owned', tenantCode: 'tenant-a', sequence: 1, eventType: 'TURN_ACCEPTED'
        },
        {
            eventCode: 'turn-owned-2', conversationCode: 'conversation-owned',
            turnCode: 'turn-owned', tenantCode: 'tenant-a', sequence: 2, eventType: 'STATUS'
        }
    ],
    messages: []
};

function matches(value, query) {
    return Object.keys(query || {}).every(key => {
        if (query[key] && query[key].$gt !== undefined) return value[key] > query[key].$gt;
        return value[key] === query[key];
    });
}

function service(name) {
    return {
        get: input => Promise.resolve({ result: store[name].filter(value => matches(value, input.query)) }),
        update: input => {
            const value = store[name].find(item => matches(item, input.query));
            if (value) Object.assign(value, input.model.$set || input.model);
            return Promise.resolve({ result: value ? [value] : [] });
        },
        save: input => {
            store[name].push(input.model);
            return Promise.resolve({ result: [input.model] });
        }
    };
}

const context = {
    identity: { tenantCode: 'tenant-a', principalCode: 'employee-a' },
    configuration: defaults,
    services: {
        conversations: service('conversations'), turns: service('turns'),
        events: service('events'), messages: service('messages')
    }
};
const request = {
    tenant: 'tenant-a',
    authData: { loginId: 'employee-a', principalType: 'human', userGroups: ['employeeUserGroup'] },
    query: {}
};

conversationService.listOwned(request, context)
    .then(result => {
        assert.strictEqual(result.items.length, 1);
        assert.strictEqual(result.items[0].conversationCode, 'conversation-owned');
        return assert.rejects(
            conversationService.getOwned('conversation-other', request, context),
            /not found for authenticated principal/
        );
    })
    .then(() => conversationService.replayEvents(
        'conversation-owned', 'turn-owned',
        Object.assign({}, request, { query: { afterSequence: 1 } }), context
    ))
    .then(result => {
        assert.strictEqual(result.items.length, 1);
        assert.strictEqual(result.items[0].sequence, 2);
        return conversationService.cancelAcceptedTurn(
            'conversation-owned', 'turn-owned', request, context
        );
    })
    .then(turn => {
        assert.strictEqual(turn.state, 'CANCELLED');
        assert(store.events.some(event => event.eventType === 'CANCELLED'));
        return conversationService.cancelAcceptedTurn(
            'conversation-owned', 'turn-owned', request, context
        );
    })
    .then(turn => {
        assert.strictEqual(turn.state, 'CANCELLED');
        console.log('AI Assistant secured route contract validated');
    });
