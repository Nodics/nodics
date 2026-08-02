/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantMutationPlanningContract
 * @description Verifies provider-neutral clarification and mutation proposals compose current-contract resolution with persisted confirmation.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const configuration = require('../config/properties').aiAssistant;
const catalogueService = require('../src/service/tool/defaultAiAssistantToolCatalogueService');
const mutationService = require('../src/service/tool/defaultAiAssistantMutationPlanningService');
const planningService = require('../src/service/tool/defaultAiAssistantToolPlanningService');

const policy = {
    contractVersion: 1,
    enabled: true,
    approvedOperations: [{
        toolId: 'profile.enterprise.create',
        ownerModule: 'profile',
        operationId: 'profile_createenterprise',
        mode: 'MUTATION',
        confirmationRequired: true,
        requiredPermissions: ['profile.enterprise.create'],
        inputSchema: {
            type: 'object', additionalProperties: false, required: ['code', 'name']
        }
    }]
};
const request = {
    tenant: 'default',
    idempotencyKey: 'mutation-planning-request-1',
    authData: {
        principalType: 'human', loginId: 'admin', entCode: 'default',
        permissions: ['profile.enterprise.create']
    }
};
const turn = {
    conversationCode: 'conversation-1',
    turnCode: 'turn-1'
};
const bootstrap = {
    catalogue: {
        profile: {
            contract: {
                operations: [{
                    operationId: 'profile_createenterprise',
                    method: 'POST',
                    path: '/nodics/profile/v0/enterprises',
                    permissions: ['profile.enterprise.create']
                }]
            }
        }
    }
};

async function run() {
    const confirmations = [];
    const runtime = {
        configuration: { tools: Object.assign({}, configuration.tools) },
        toolPolicy: policy,
        backofficeCatalogueProvider: () => Promise.resolve(bootstrap),
        confirmationService: {
            create: input => {
                confirmations.push(input);
                return Promise.resolve({
                    data: {
                        confirmation: {
                            confirmationCode: 'confirmation-1',
                            conversationCode: input.body.conversationCode,
                            operationId: input.body.operationId,
                            state: 'PENDING',
                            arguments: input.body.arguments,
                            argumentsDigest: 'a'.repeat(64),
                            revision: 0,
                            expiresAt: new Date(Date.now() + 60000),
                            impact: {
                                type: 'CREATE', ownerModule: 'profile',
                                resource: 'enterprise', summary: 'Create enterprise acme'
                            }
                        }
                    }
                });
            }
        }
    };
    const tools = await catalogueService.list(policy, request, runtime);
    assert.strictEqual(tools.length, 1);
    assert.strictEqual(tools[0].mode, 'MUTATION');
    assert.strictEqual(tools[0].confirmationRequired, true);
    assert.strictEqual(JSON.stringify(tools).includes('/nodics/profile'), false);

    const parsed = planningService.parse(JSON.stringify({
        contractVersion: 1,
        type: 'MUTATION_PROPOSAL',
        toolId: 'profile.enterprise.create',
        ownerModule: 'profile',
        operationId: 'profile_createenterprise',
        arguments: { code: 'acme', name: 'Acme' }
    }), configuration);
    const proposed = await mutationService.process(parsed, turn, request, runtime);
    assert.strictEqual(proposed.eventType, 'CONFIRMATION_REQUIRED');
    assert.strictEqual(proposed.data.confirmation.state, 'PENDING');
    assert.strictEqual(proposed.data.confirmation.arguments, undefined,
        'Provider arguments must not be echoed to the client event');
    assert.deepStrictEqual(confirmations[0].body.arguments, {
        code: 'acme', name: 'Acme'
    });
    assert(confirmations[0].body.idempotencyKey.startsWith('assistant-confirmation-'));

    const missing = await mutationService.process(Object.assign({}, parsed, {
        plan: Object.assign({}, parsed.plan, { arguments: { code: 'acme' } })
    }), turn, request, runtime);
    assert.strictEqual(missing.eventType, 'CLARIFICATION');
    assert.deepStrictEqual(missing.data.missingFields, ['name']);
    assert.strictEqual(missing.text, missing.data.question);
    assert.strictEqual(confirmations.length, 1,
        'Clarification must not persist a confirmation');

    const clarification = planningService.parse(JSON.stringify({
        contractVersion: 1,
        type: 'CLARIFICATION',
        question: 'What is the enterprise name?',
        missingFields: ['name']
    }), configuration);
    assert.deepStrictEqual(clarification.missingFields, ['name']);
    assert.throws(() => planningService.parse(JSON.stringify({
        contractVersion: 1,
        type: 'MUTATION_PROPOSAL',
        toolId: 'profile.enterprise.create',
        ownerModule: 'profile',
        operationId: 'profile_createenterprise',
        arguments: { code: 'acme', name: 'Acme' },
        url: 'https://attacker.invalid'
    }), configuration), /AI_ASSISTANT_TOOL_PLAN_INVALID/);
    await assert.rejects(mutationService.process(Object.assign({}, parsed, {
        plan: Object.assign({}, parsed.plan, {
            arguments: { code: 'acme', name: 'Acme', secret: 'not-allowed' }
        })
    }), turn, request, runtime), /AI_ASSISTANT_TOOL_PLAN_INVALID/);
    const unauthorized = await catalogueService.list(policy, Object.assign({}, request, {
        authData: Object.assign({}, request.authData, { permissions: [] })
    }), runtime);
    assert.deepStrictEqual(unauthorized, []);
    await assert.rejects(mutationService.process(parsed, turn, Object.assign({}, request, {
        authData: Object.assign({}, request.authData, { permissions: [] })
    }), runtime), /AI_ASSISTANT_TOOL_NOT_AUTHORIZED/);
    assert.strictEqual(confirmations.length, 1,
        'Unauthorized proposals must not persist a confirmation');

    console.log('AI Assistant mutation planning contract validated');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
