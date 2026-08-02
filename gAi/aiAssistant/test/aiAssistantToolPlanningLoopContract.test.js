/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantToolPlanningLoopContract
 * @description Verifies strict provider-neutral planning, governed read execution, answer synthesis, usage, and event behavior.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const defaults = require('../config/properties').aiAssistant;
const orchestration = require('../src/service/turn/defaultAiAssistantTurnOrchestrationService');
const toolExecutor = require('../src/service/tool/defaultAiAssistantToolExecutionService');
const planningService = require('../src/service/tool/defaultAiAssistantToolPlanningService');
const configuration = JSON.parse(JSON.stringify(defaults));
configuration.enabled = true;
configuration.tools.enabled = true;
const store = { conversations: [], messages: [], turns: [], events: [] };

function matches(value, query) {
    return Object.keys(query || {}).every(key => value[key] === query[key]);
}

function service(name) {
    return {
        save: input => {
            store[name].push(input.model);
            return Promise.resolve({ result: [input.model] });
        },
        get: input => Promise.resolve({
            result: store[name].filter(value => matches(value, input.query))
        }),
        update: input => {
            const target = store[name].find(value => matches(value, input.query));
            if (target) Object.assign(target, input.model);
            return Promise.resolve({ result: target ? [target] : [] });
        }
    };
}

const services = {
    conversations: service('conversations'),
    messages: service('messages'),
    turns: service('turns'),
    events: service('events')
};
const policy = {
    contractVersion: 1,
    enabled: true,
    approvedOperations: [{
        toolId: 'profile.employee.read',
        ownerModule: 'profile',
        operationId: 'profile_employee_get',
        mode: 'READ',
        description: 'Read one employee',
        requiredPermissions: ['profile.employee.read'],
        resultFields: ['employee']
    }]
};
const request = {
    tenant: 'default',
    authToken: 'employee-token',
    definitionCode: 'axisAssistant',
    promptCode: 'axis-readonly',
    idempotencyKey: 'assistant-tool-turn-0001',
    message: 'Show employee one',
    authData: {
        loginId: 'admin',
        principalType: 'human',
        entCode: 'default',
        userGroups: ['employeeUserGroup'],
        permissions: ['profile.employee.read']
    }
};
const providerCalls = [];
global.SERVICE = {
    DefaultModuleService: {
        buildRequest: options => options,
        fetch: descriptor => {
            assert.strictEqual(descriptor.moduleName, 'profile');
            assert.strictEqual(descriptor.apiName, '/employees/employee-one');
            return Promise.resolve({
                data: { data: { employee: { code: 'employee-one', name: 'Employee One' } } }
            });
        }
    }
};
const runtime = {
    configuration: configuration,
    configurationRevision: 'assistant-tool-config-1',
    services: services,
    toolPolicy: policy,
    toolExecutor: toolExecutor,
    toolEventPublisher: (turn, eventType, data, eventRequest, context) =>
        require('../src/service/conversation/defaultAiAssistantConversationService')
            .appendEvent(turn, eventType, data, eventRequest, context),
    promptService: {
        get: () => Promise.resolve({
            result: [{
                promptCode: 'axis-readonly',
                version: 1,
                status: 'ACTIVE',
                instructions: 'Help the authenticated employee.'
            }]
        })
    },
    backofficeCatalogueProvider: () => Promise.resolve({
        catalogue: {
            profile: {
                contract: {
                    operations: [{
                        operationId: 'profile_employee_get',
                        path: '/nodics/profile/v0/employees/{employeeCode}',
                        method: 'GET',
                        permissions: ['profile.employee.read']
                    }]
                }
            }
        }
    }),
    providerGateway: {
        execute: (profile, operation, input, context) => {
            providerCalls.push({ input: input, context: context });
            if (providerCalls.length === 1) {
                return Promise.resolve({
                    text: JSON.stringify({
                        contractVersion: 1,
                        type: 'TOOL_CALL',
                        toolId: 'profile.employee.read',
                        ownerModule: 'profile',
                        operationId: 'profile_employee_get',
                        arguments: {
                            pathParameters: { employeeCode: 'employee-one' },
                            queryParameters: {}
                        }
                    }),
                    finishReason: 'STOP',
                    providerRequestId: 'provider-plan',
                    usage: { inputTokens: 20, outputTokens: 10 },
                    usageReconciliation: {
                        reservationId: 'reservation-plan',
                        state: 'RECONCILED'
                    }
                });
            }
            assert(input.instructions.includes('untrusted business data'));
            assert(input.messages.some(message =>
                message.content.includes('"employee-one"')));
            return Promise.resolve({
                text: 'Employee One was found.',
                finishReason: 'STOP',
                providerRequestId: 'provider-answer',
                usage: { inputTokens: 30, outputTokens: 6 },
                usageReconciliation: {
                    reservationId: 'reservation-answer',
                    state: 'RECONCILED'
                }
            });
        }
    }
};

async function run() {
    const result = await orchestration.process(request, runtime);
    assert.strictEqual(result.result.text, 'Employee One was found.');
    assert.strictEqual(providerCalls.length, 2);
    assert(providerCalls[0].input.instructions.includes('Available logical tools'));
    assert.strictEqual(providerCalls[0].input.instructions.includes('/nodics/profile'), false,
        'Executable target paths must not be disclosed as provider tool metadata');
    assert(providerCalls[0].context.idempotencyKey.endsWith(':plan'));
    assert(providerCalls[1].context.idempotencyKey.endsWith(':answer'));
    assert.deepStrictEqual(store.events.filter(event =>
        event.eventType.startsWith('TOOL_')).map(event => event.eventType), [
        'TOOL_PLAN', 'TOOL_STARTED', 'TOOL_RESULT'
    ]);
    assert.strictEqual(JSON.stringify(store.events.filter(event =>
        event.eventType.startsWith('TOOL_'))).includes('Employee One'), false,
        'Persisted tool events must not contain returned business data');
    assert.deepStrictEqual(store.events.filter(event =>
        event.eventType === 'USAGE').map(event => event.data.phase), [
        'PLANNING', 'ANSWER'
    ]);
    assert.strictEqual(store.messages.filter(message =>
        message.role === 'assistant').pop().content, 'Employee One was found.');

    assert.throws(() => planningService.parse(
        'prefix {"contractVersion":1,"type":"ANSWER","answer":"unsafe"}',
        configuration
    ), /AI_ASSISTANT_TOOL_PLAN_INVALID/);
    assert.throws(() => planningService.parse(JSON.stringify({
        contractVersion: 1,
        type: 'TOOL_CALL',
        toolId: 'profile.employee.read',
        ownerModule: 'profile',
        operationId: 'profile_employee_get',
        url: 'https://attacker.invalid',
        arguments: {}
    }), configuration), /AI_ASSISTANT_TOOL_PLAN_INVALID/);
    console.log('AI Assistant provider-neutral tool planning loop validated');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
