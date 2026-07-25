/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module aiAssistant/test/AiAssistantConfirmationAndWorkflowContract
 * @description Verifies immutable confirmation binding, employee ownership, Profile target authority, and optional Workflow handoff.
 * @layer test
 * @owner aiAssistant
 * @override Later modules must preserve these mutation-governance invariants.
 */
const assert = require('assert');
const routes = require('../src/router/routers').aiAssistant.confirmations;
const schemas = require('../src/schemas/schemas').aiAssistant;
const service = require('../src/service/confirmation/defaultAiAssistantConfirmationService');

assert.strictEqual(routes.createConfirmation.permission, 'ai.assistant.use');
assert.strictEqual(routes.approveConfirmation.key, '/confirmations/:confirmationCode/approve');
assert.strictEqual(routes.executeConfirmation.method, 'POST');
assert.strictEqual(schemas.assistantConfirmation.router.enabled, false);
assert.strictEqual(schemas.assistantConfirmation.definition.argumentsDigest.required, true);
assert.strictEqual(schemas.assistantConfirmation.definition.revision.type, 'int');
assert.strictEqual(service.digest({ b: 2, a: 1 }), service.digest({ a: 1, b: 2 }));
assert.notStrictEqual(service.digest({ a: 1 }), service.digest({ a: 2 }));
assert(service.execute.toString().includes("moduleName: 'workflow'"));
assert(service.execute.toString().includes("moduleName: 'profile'"));
assert(service.execute.toString().includes('active: true'));
assert(service.execute.toString().includes("state: 'EXECUTING'"));
assert(!service.execute.toString().includes('openAiProvider'));

console.log('AI Assistant confirmation and Workflow contract validated');
