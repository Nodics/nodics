/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const merge = require('lodash/merge');

/**
 * @module gAi/test/aiConfigurationLayeringContract
 * @description Prevents topology layers from becoming duplicate AI provider-definition and policy authorities.
 * @layer test
 * @owner gAi
 */

const provider = require('../aiProviders/openAiProvider/config/properties').aiProviders;
const gateway = require('../aiProviders/config/properties');
const project = require('../../startio/modules/startioCore/config/properties');
const environment = require('../../startio/envs/startioLocal/config/properties');
const server = require('../../startio/envs/startioLocal/monoServer/config/properties');
const configurationService =
    require('../aiProviders/src/service/config/defaultAiProviderConfigurationService');

assert.strictEqual(provider.providers.openAi.enabled, false);
assert.strictEqual(provider.providers.openAi.secretReference, 'env://OPENAI_API_KEY');
assert(provider.pricing.models['openAi:gpt-5-mini'],
    'OpenAI provider module must own its reviewed model pricing');

assert.strictEqual(project.aiAssistant.enabled, true);
assert.strictEqual(project.aiKnowledge.enabled, true);
assert(project.aiProviders.tokenOptimization.profiles.assistantGeneration,
    'Startio project module must own reusable application token policy');

assert.strictEqual(environment.aiProviders, undefined,
    'Environment must not duplicate complete AI provider configuration');
assert.strictEqual(environment.aiAssistant.tools.enabled, true,
    'Local-only Assistant tool acceptance belongs to the environment layer');

assert(server.activeModules.modules.includes('gAi'));
assert(server.activeModules.modules.includes('openAiProvider'));
assert.deepStrictEqual(Object.keys(server.aiProviders).sort(),
    ['enabled', 'profiles', 'providers']);
assert.deepStrictEqual(server.aiProviders.profiles.assistantGeneration, {
    provider: 'openAi',
    model: 'gpt-5-mini'
});
assert.deepStrictEqual(server.aiProviders.providers.openAi, { enabled: true });
['pricing', 'tokenOptimization', 'resilience', 'ledger', 'security', 'controls'].forEach(key => {
    assert.strictEqual(server.aiProviders[key], undefined,
        'Server AI configuration must not own ' + key);
});
assert.strictEqual(server.aiAssistant, undefined,
    'Server must not own Assistant business behavior');
assert.strictEqual(server.aiKnowledge, undefined,
    'Server must not own Knowledge business behavior');

const effective = merge({}, gateway, { aiProviders: provider }, project, environment, server);
assert.strictEqual(effective.aiProviders.enabled, true);
assert.strictEqual(effective.aiProviders.profiles.assistantGeneration.capability, 'GENERATION');
assert.deepStrictEqual(effective.aiProviders.profiles.assistantGeneration.fallbackProviders, []);
assert.strictEqual(effective.aiProviders.providers.openAi.enabled, true);
assert.strictEqual(effective.aiProviders.providers.openAi.secretReference, 'env://OPENAI_API_KEY');
assert.strictEqual(effective.aiProviders.providers.openAi.baseUrl, 'https://api.openai.com/v1');
assert.strictEqual(effective.aiProviders.tokenOptimization.profiles.assistantGeneration.maximumInputTokens, 24000);
assert.strictEqual(effective.aiProviders.tokenOptimization.profiles.assistantGeneration.maximumOutputTokens, 512);
assert.strictEqual(effective.aiProviders.pricing.models['openAi:gpt-5-mini'].currencyCode, 'USD');
assert.strictEqual(effective.aiAssistant.enabled, true);
assert.strictEqual(effective.aiAssistant.tools.enabled, true);
assert.strictEqual(effective.aiKnowledge.enabled, true);
assert.strictEqual(configurationService.validate(effective.aiProviders), true,
    'Fully merged Startio AI provider configuration must satisfy the gateway contract');

console.log('AI configuration layering contract validated');
