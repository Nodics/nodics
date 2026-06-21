const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * @module nTest/test/layeredTestDiscovery
 * @description Proves deterministic test composition across arbitrarily named capability, project, environment, server, and node modules with override traceability and configurable additional paths.
 * @layer test
 * @owner nTest
 * @override Projects may add discovery-layout fixtures while preserving metadata-driven active-module ordering.
 */

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-layered-tests-'));
const modules = [
    { name: 'BaseCapability', kind: 'capability', suite: 'sharedSuite', type: 'utest', value: 1 },
    { name: 'CustomerProject', kind: 'project', suite: 'projectSuite', type: 'utest', value: 2 },
    { name: 'BlueBoundary', kind: 'environment', suite: 'sharedSuite', type: 'ntest', value: 3 },
    { name: 'RuntimeRole', kind: 'server', suite: 'serverSuite', type: 'ntest', value: 4 },
    { name: 'ReplicaA', kind: 'node', suite: 'nodeSuite', type: 'ntest', value: 5 }
];

modules.forEach((module, index) => {
    module.path = path.join(root, module.name);
    module.metaData = { nodics: { kind: module.kind } };
    const commonPath = path.join(module.path, 'test', 'common');
    fs.mkdirSync(commonPath, { recursive: true });
    fs.writeFileSync(path.join(commonPath, 'suite.js'), 'module.exports = ' + JSON.stringify({
        [module.suite]: {
            options: { description: module.name, type: module.type },
            data: Object.assign({ value: module.value }, index === 0 ? { inheritedFromCapability: true } : {}),
            group: { options: { description: 'group' }, test: { description: 'test' } }
        }
    }) + ';');
    module.index = String(index);
});

const customPath = path.join(modules[1].path, 'test', 'project-scenarios');
fs.mkdirSync(customPath, { recursive: true });
fs.writeFileSync(path.join(customPath, 'custom.js'), 'module.exports = { customSuite: { options: { description: "custom", type: "utest" }, data: { custom: true } } };');

global.TEST = { uTestPool: { data: {}, suites: {} }, nTestPool: { data: {}, suites: {} } };
global.NODICS = {
    /** @returns {Map<string, object>} active fixture modules in deterministic layer order */
    getIndexedModules: function () { return new Map(modules.map(module => [module.index, module])); },
    /** @returns {string} temporary framework home used by the discovery fixture */
    getNodicsHome: function () { return root; }
};

const service = require('../src/service/defaultLayeredTestConfigurationService');

try {
    service.discover({ paths: ['test/project-scenarios'] });
    assert(TEST.uTestPool.suites.projectSuite);
    assert(TEST.uTestPool.suites.customSuite);
    assert(TEST.nTestPool.suites.sharedSuite);
    assert.strictEqual(TEST.nTestPool.suites.sharedSuite.data.inheritedFromCapability, true);
    assert.strictEqual(TEST.uTestPool.suites.sharedSuite, undefined);
    assert(TEST.nTestPool.suites.serverSuite);
    assert(TEST.nTestPool.suites.nodeSuite);
    assert.strictEqual(TEST.nTestPool.data.value, 5);
    assert.strictEqual(TEST.discovery.contributions.length, 6);
    assert.strictEqual(TEST.discovery.overrides.length, 1);
    assert.strictEqual(TEST.discovery.overrides[0].suiteName, 'sharedSuite');
    assert(TEST.discovery.contributions.some(item => item.moduleKind === 'environment' && item.moduleName === 'BlueBoundary'));
    assert(TEST.discovery.contributions.some(item => item.moduleKind === 'node' && item.moduleName === 'ReplicaA'));
    service.discover({ paths: ['test/project-scenarios'] });
    assert.strictEqual(TEST.discovery.contributions.length, 6);
    assert.strictEqual(TEST.discovery.overrides.length, 1);
    console.log('Layered test discovery validated');
} finally {
    fs.rmSync(root, { recursive: true, force: true });
}
