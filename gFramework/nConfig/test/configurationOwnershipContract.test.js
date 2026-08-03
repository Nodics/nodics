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
const merge = require('lodash/merge');

/**
 * @module gFramework/nConfig/test/configurationOwnershipContract
 * @description Prevents environment, server, and node properties from becoming copied snapshots of module defaults.
 * @layer test
 * @owner nConfig
 */

const root = path.resolve(__dirname, '../../..');
const envRoot = path.join(root, 'startio/envs');

function findProperties(directory, result) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            findProperties(target, result);
        } else if (target.endsWith(path.join('config', 'properties.js'))) {
            result.push(target);
        }
    });
    return result;
}

function load(relativePath) {
    return require(path.join(root, relativePath));
}

const topologySources = findProperties(envRoot, []).map(file => ({
    file,
    source: fs.readFileSync(file, 'utf8')
}));

const inheritedPlaceholderPatterns = [
    {
        expression: /contextRoot:\s*['"]nodics['"]/,
        message: 'contextRoot nodics is inherited from nRouter'
    },
    {
        expression: /runOnStartup:\s*false/,
        message: 'cronjob.runOnStartup false is inherited from cronjob'
    },
    {
        expression: /logFailedMessages:\s*false/,
        message: 'emsClient.logFailedMessages false is inherited from emsClient'
    }
];

topologySources.forEach(entry => inheritedPlaceholderPatterns.forEach(pattern => {
    assert(!pattern.expression.test(entry.source),
        path.relative(root, entry.file) + ' must not restate an inherited default: ' + pattern.message);
}));

const framework = merge({},
    load('gFramework/nConfig/config/properties.js'),
    load('gFramework/nRouter/config/properties.js'),
    load('gFramework/nSearch/search/config/properties.js'),
    load('gFramework/nEms/emsClient/config/properties.js'),
    load('gCore/cronjob/config/properties.js'));
const local = load('startio/envs/startioLocal/config/properties.js');

const backoffice = merge({}, framework, local,
    load('startio/envs/startioLocal/backofficeServer/config/properties.js'));
assert.strictEqual(backoffice.log.level, 'info');
assert.strictEqual(backoffice.cronjob.runOnStartup, false);
assert.strictEqual(backoffice.search.default.options.enabled, false);
assert.strictEqual(backoffice.servers.options.contextRoot, 'nodics');

const deap = merge({}, framework, local,
    load('startio/envs/startioLocal/deapServer/config/properties.js'));
assert.strictEqual(deap.emsClient.logFailedMessages, false);
assert.strictEqual(deap.search.default.options.enabled, false);
assert.strictEqual(deap.log.level, 'debug',
    'Server-specific debug logging must remain an intentional override');

const mono = merge({}, framework, local,
    load('startio/envs/startioLocal/monoServer/config/properties.js'));
assert.strictEqual(mono.cronjob.runOnStartup, false);
assert.strictEqual(mono.search.default.options.enabled, true);
assert.strictEqual(mono.search.default.options.engine, 'elastic');

const publicationDefaults = merge({},
    load('gContent/cms/config/properties.js'),
    load('gComm/baseCommerce/pricing/config/properties.js'),
    load('gComm/baseCommerce/product/config/properties.js'));
const staged = merge({}, publicationDefaults,
    load('startio/envs/startioLocal/cmsStagedServer/config/properties.js'));
['cms', 'pricing', 'product'].forEach(moduleName => {
    assert.strictEqual(staged[moduleName].publication.target.timeoutMs, 30000);
    assert.strictEqual(staged[moduleName].publication.target.maxAttempts, 3);
});

const online = merge({}, publicationDefaults,
    load('startio/envs/startioLocal/cmsOnlineServer/config/properties.js'));
['cms', 'pricing', 'product'].forEach(moduleName => {
    assert.strictEqual(online[moduleName].publication.targetTransportProvider, null);
});

console.log('Framework-wide configuration ownership contract validated');
