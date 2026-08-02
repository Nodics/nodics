/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const group = require('../package.json');
const assistant = require('../aiAssistant/package.json');
const knowledge = require('../aiKnowledge/package.json');
const providers = require('../aiProviders/package.json');
const openAi = require('../aiProviders/openAiProvider/package.json');
const anthropic = require('../aiProviders/anthropicProvider/package.json');
const gemini = require('../aiProviders/geminiProvider/package.json');

assert.strictEqual(group.name, 'gAi');
assert.deepStrictEqual(group.requiredModules, ['aiAssistant', 'aiKnowledge', 'aiProviders']);
assert.strictEqual(assistant.name, 'aiAssistant');
assert.strictEqual(knowledge.name, 'aiKnowledge');
assert.strictEqual(providers.name, 'aiProviders');
assert.strictEqual(providers.nodics.kind, 'group');
assert(providers.nodics.owns.includes('composition'));
assert(providers.nodics.owns.includes('service'));
assert.strictEqual(providers.requiredModules, undefined,
    'aiProviders must not automatically activate every vendor provider');
assert.strictEqual(openAi.name, 'openAiProvider');
assert.strictEqual(anthropic.name, 'anthropicProvider');
assert.strictEqual(gemini.name, 'geminiProvider');

function source(relativePath) {
    return fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
}

const callerSource = [
    source('aiAssistant/config/properties.js'),
    source('aiAssistant/src/schemas/apiContracts.js'),
    source('aiKnowledge/config/properties.js'),
    source('aiKnowledge/src/schemas/apiContracts.js')
].join('\n').toLowerCase();

['openai', 'anthropic', 'gemini'].forEach(providerName => {
    assert(!callerSource.includes(providerName), 'AI callers must not reference vendor provider: ' + providerName);
});
assert(!callerSource.includes('secretreference'), 'AI caller configuration must not own provider secret references');

console.log('gAi ownership and provider abstraction contract validated');
