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

const toolingCommandService = require('../src/service/defaultToolingCommandService');

assert(toolingCommandService.compareModuleIndex('1.9', '1.10') < 0,
    'Dotted module indexes must be compared numerically');

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
fs.writeFileSync(path.join(projectModule, 'package.json'), JSON.stringify({
    name: 'projectTooling',
    index: '1000.0',
    nodics: {
        kind: 'tooling',
        runtimeModule: false,
        loadableByNodicsModuleLoader: false,
        tooling: {
            commands: 'config/tooling.js'
        }
    }
}), 'utf8');
fs.writeFileSync(path.join(projectModule, 'nodics.js'), 'module.exports = {};\n', 'utf8');
fs.writeFileSync(path.join(projectModule, 'config', 'tooling.js'), [
    'module.exports = { commands: {',
    '  "quality:docs": {',
    '    handler: "src/projectQuality.js",',
    '    $override: { mode: "replace" }',
    '  }',
    '} };',
    ''
].join('\n'), 'utf8');

try {
    const projectRegistry = toolingCommandService.loadCommands(projectHome);
    assert.strictEqual(projectRegistry['quality:docs'].sourceModule, 'projectTooling');
    assert.strictEqual(projectRegistry['quality:docs'].handler, 'src/projectQuality.js');
    assert.strictEqual(projectRegistry['quality:docs'].xNodics.overrideTrace.length, 2);
} finally {
    fs.rmSync(projectHome, { recursive: true, force: true });
}

console.log('nTooling command overrides validated');
