const assert = require('assert');

const {
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

const validModuleTypes = new Set([
    'application',
    'capability',
    'core',
    'environment',
    'group',
    'node',
    'publish',
    'router',
    'server',
    'setup',
    'template',
    'web'
]);

const modules = scanModules();

assert(modules.length > 0, 'No Nodics packages were discovered');

modules.forEach(module => {
    const meta = module.packageJson;
    const nodics = meta.nodics || {};
    assert(nodics.kind, 'Missing nodics.kind for package: ' + module.relativePath);
    assert(validKinds.has(nodics.kind), 'Invalid nodics.kind `' + nodics.kind + '` for package: ' + module.relativePath);
    assert(nodics.moduleType, 'Missing nodics.moduleType for package: ' + module.relativePath);
    assert(validModuleTypes.has(nodics.moduleType), 'Invalid nodics.moduleType `' + nodics.moduleType + '` for package: ' + module.relativePath);
    assert(Array.isArray(nodics.owns), 'nodics.owns must be an array for package: ' + module.relativePath);

    if (nodics.kind === 'setup') {
        assert.strictEqual(nodics.runtimeModule, false, 'setup package must not be runtime loadable: ' + module.relativePath);
        assert.strictEqual(nodics.loadableByNodicsModuleLoader, false, 'setup package must not be module-loader loadable: ' + module.relativePath);
    }

    if (nodics.kind === 'group') {
        assert(nodics.owns.includes('composition'), 'group packages must own composition: ' + module.relativePath);
    }

    if (['environment', 'server', 'node'].includes(nodics.kind)) {
        assert(nodics.owns.includes('configuration') || nodics.owns.includes('llm'), 'environment/server/node packages must document configuration/topology ownership: ' + module.relativePath);
    }
});

console.log('Nodics module metadata validated: ' + modules.length + ' packages');
