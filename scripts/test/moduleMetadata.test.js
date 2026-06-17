const assert = require('assert');
const fs = require('fs');
const path = require('path');

const {
    rootPath,
    scanModules
} = require('../module-llm-context-utils');

const validKinds = new Set([
    'application',
    'capability',
    'environment',
    'group',
    'node',
    'publish',
    'server',
    'setup',
    'template',
    'web'
]);

const validRuntimeKeys = new Set([
    'publish',
    'router',
    'web'
]);

const rootPackage = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8'));
const modules = [{
    name: rootPackage.name,
    relativePath: '.',
    packageJson: rootPackage
}].concat(scanModules());

assert(modules.length > 0, 'No Nodics packages were discovered');

modules.forEach(module => {
    const meta = module.packageJson;
    const nodics = meta.nodics || {};
    assert.strictEqual(meta.type, undefined, 'Do not use top-level package.json type for Nodics metadata: ' + module.relativePath);
    assert(nodics.kind, 'Missing nodics.kind for package: ' + module.relativePath);
    assert(validKinds.has(nodics.kind), 'Invalid nodics.kind `' + nodics.kind + '` for package: ' + module.relativePath);
    assert.strictEqual(nodics.moduleType, undefined, 'Do not use nodics.moduleType; use nodics.kind and nodics.runtime: ' + module.relativePath);
    assert(Array.isArray(nodics.owns), 'nodics.owns must be an array for package: ' + module.relativePath);
    assert(nodics.runtime && typeof nodics.runtime === 'object' && !Array.isArray(nodics.runtime),
        'nodics.runtime must be an object for package: ' + module.relativePath);
    Object.keys(nodics.runtime).forEach(runtimeKey => {
        assert(validRuntimeKeys.has(runtimeKey), 'Invalid nodics.runtime key `' + runtimeKey + '` for package: ' + module.relativePath);
        assert.strictEqual(typeof nodics.runtime[runtimeKey], 'boolean',
            'nodics.runtime values must be boolean for package: ' + module.relativePath);
    });

    if (nodics.kind === 'setup') {
        assert.strictEqual(nodics.runtimeModule, false, 'setup package must not be runtime loadable: ' + module.relativePath);
        assert.strictEqual(nodics.loadableByNodicsModuleLoader, false, 'setup package must not be module-loader loadable: ' + module.relativePath);
        assert.strictEqual(nodics.runtime.router, false, 'setup package must not expose routers: ' + module.relativePath);
        assert.strictEqual(nodics.runtime.publish, false, 'setup package must not be publish gated: ' + module.relativePath);
        assert.strictEqual(nodics.runtime.web, false, 'setup package must not be web gated: ' + module.relativePath);
    }

    if (nodics.kind === 'publish') {
        assert.strictEqual(nodics.runtime.publish, true, 'publish package must declare nodics.runtime.publish: ' + module.relativePath);
    }

    if (nodics.kind === 'web') {
        assert.strictEqual(nodics.runtime.web, true, 'web package must declare nodics.runtime.web: ' + module.relativePath);
    }

    if (nodics.kind === 'group') {
        assert(nodics.owns.includes('composition'), 'group packages must own composition: ' + module.relativePath);
    }

    if (['environment', 'server', 'node'].includes(nodics.kind)) {
        assert(nodics.owns.includes('configuration') || nodics.owns.includes('llm'), 'environment/server/node packages must document configuration/topology ownership: ' + module.relativePath);
    }
});

console.log('Nodics module metadata validated: ' + modules.length + ' packages');
