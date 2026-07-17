/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/toolingCommandOverride
 * @description Verifies numeric command contribution ordering, explicit handler replacement, override traceability, and project-home tooling discovery.
 * @layer test
 * @owner nTooling
 * @override Project tooling modules may add integration scenarios without weakening explicit replacement governance.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const toolingProperties = require('../config/properties');
const toolingCommandService = require('../src/service/defaultToolingCommandService');

assert(toolingCommandService.compareModuleIndex('1.9', '1.10') < 0,
    'Dotted module indexes must be compared numerically');

assert(toolingProperties.tooling.discovery.ignoredDirectories.includes('node_modules'),
    'Tooling discovery exclusions must be owned by config/properties.js');
assert(toolingProperties.tooling.discovery.ignoredFiles.includes('.DS_Store'),
    'Tooling discovery file exclusions must be owned by config/properties.js');
assert.strictEqual(toolingCommandService.shouldVisitDirectory({
    name: 'node_modules'
}), false, 'Tooling command discovery must apply configured ignored directories');
assert.strictEqual(toolingCommandService.shouldVisitDirectory({
    name: 'customerModule'
}), true, 'Tooling command discovery must keep normal module directories traversable');

const registry = {};
toolingCommandService.mergeCommand(registry, 'sample', {
    handler: 'src/default.js'
}, {
    name: 'frameworkTooling',
    index: '1.0',
    path: '/framework'
});

assert.throws(() => {
    toolingCommandService.mergeCommand(registry, 'sample', {
        handler: 'src/project.js'
    }, {
        name: 'projectTooling',
        index: '1000.0',
        path: '/project'
    });
}, /without \$override\.mode="replace"/,
'Changing a tooling handler must require an explicit replacement');

toolingCommandService.mergeCommand(registry, 'sample', {
    handler: 'src/project.js',
    $override: {
        mode: 'replace'
    }
}, {
    name: 'projectTooling',
    index: '1000.0',
    path: '/project'
});

assert.strictEqual(registry.sample.handler, 'src/project.js');
assert.strictEqual(registry.sample.sourceModule, 'projectTooling');
assert.strictEqual(registry.sample.xNodics.overrideTrace.length, 2);

const projectHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-tooling-'));
const projectModule = path.join(projectHome, 'projectTooling');
fs.mkdirSync(path.join(projectModule, 'config'), { recursive: true });
fs.mkdirSync(path.join(projectModule, 'src', 'service', 'mcp'), { recursive: true });
fs.writeFileSync(path.join(projectModule, 'package.json'), JSON.stringify({
    name: 'projectTooling',
    index: '1000.0',
    nodics: {
        kind: 'tooling',
        runtimeModule: false,
        loadableByNodicsModuleLoader: false,
        entrypoints: {
            properties: 'config/properties.js'
        }
    }
}), 'utf8');
fs.writeFileSync(path.join(projectModule, 'nodics.js'), 'module.exports = {};\n', 'utf8');
fs.writeFileSync(path.join(projectModule, 'config', 'properties.js'), [
    'module.exports = { tooling: { commands: {',
    '  "quality:docs": {',
    '    handler: "src/projectQuality.js",',
    '    $override: { mode: "replace" }',
    '  },',
    '  "mcp:validate": {',
    '    customerValidationProfile: "strict-local"',
    '  }',
    '} } };',
    ''
].join('\n'), 'utf8');
fs.writeFileSync(path.join(projectModule, 'src', 'service', 'mcp', 'defaultMcpMutationGuardService.js'), [
    'module.exports = {',
    '  createPlan: function () {',
    '    return { contract: "customer mutation plan", executableByDefault: false };',
    '  }',
    '};',
    ''
].join('\n'), 'utf8');

try {
    const projectRegistry = toolingCommandService.loadCommands(projectHome);
    assert.strictEqual(projectRegistry['docs:openapi'].sourceModule, 'router',
        'External projects must inherit framework-owned router tooling');
    assert.strictEqual(projectRegistry['test:generated'].sourceModule, 'nTest',
        'External projects must inherit framework-owned test tooling');
    assert.strictEqual(projectRegistry['governance:report'].sourceModule, 'dynamo',
        'External projects must inherit framework-owned governance tooling');
    assert.strictEqual(projectRegistry['quality:docs'].sourceModule, 'projectTooling');
    assert.strictEqual(projectRegistry['quality:docs'].handler, 'src/projectQuality.js');
    assert.strictEqual(projectRegistry['quality:docs'].xNodics.overrideTrace.length, 2);
    const mergedMutationService = toolingCommandService.loadMergedService(projectHome, 'defaultMcpMutationGuardService');
    assert.strictEqual(mergedMutationService.createPlan().contract, 'customer mutation plan',
        'Project modules must override only createPlan through standard src/service merge');
    assert.strictEqual(typeof mergedMutationService.getActionCatalog, 'function',
        'Project service merge must preserve default MCP mutation service methods');
    assert.strictEqual(projectRegistry['mcp:validate'].sourceModule, 'projectTooling');
    assert.strictEqual(projectRegistry['mcp:validate'].handler, '@nTooling/mcp-validate',
        'Project modules must be able to merge MCP command metadata without replacing the handler');
    assert.strictEqual(projectRegistry['mcp:validate'].service, 'defaultMcpValidationService',
        'Inherited MCP services must remain standard service names after project metadata merges');
    assert.strictEqual(projectRegistry['mcp:validate'].customerValidationProfile, 'strict-local');
} finally {
    fs.rmSync(projectHome, { recursive: true, force: true });
}

console.log('nTooling command overrides validated');
