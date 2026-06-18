/**
 * @module config/test/configurationValidation
 * @description Validates consolidated and modular environment/server/node configuration resolution, canonical package kinds, required module ordering, topology declarations, and negative startup cases.
 * @layer test
 * @owner nConfig
 * @override Project applications should add their own topology fixtures through project modules while preserving these generic hierarchy and metadata invariants.
 */
const assert = require('assert');
const path = require('path');

const Nodics = require('../bin/nodics');
const Config = require('../bin/config');
const utils = require('../src/utils/utils');
const initService = require('../src/service/DefaultFrameworkInitializerService');

const repoRoot = path.resolve(__dirname, '../../../');

function initializeConfiguration(defaultServer, nodeName) {
    let originalArgv = process.argv.slice();
    global.NODICS = new Nodics();
    global.CONFIG = new Config();
    NODICS.init({
        NODICS_HOME: repoRoot,
        defaultServer: defaultServer
    });
    utils.loadRawModuleList(NODICS.getNodicsHome());
    process.argv = process.argv.slice(0, 2);
    if (nodeName) {
        process.argv.push('NODE=' + nodeName);
    }
    NODICS.initEnvironment({
        defaultServer: defaultServer
    });
    process.argv = originalArgv;
    initService.prepareOptions();
    initService.LOG = {
        debug: function () { },
        info: function () { },
        warn: function () { },
        error: function () { }
    };
    initService.loadModuleIndex();
    initService.loadModulesMetaData();
    initService.loadConfigurations();
    initService.validateResolvedConfiguration();
}

let localServers = [
    'kickoffLocalServer',
    'kickoffLocalProfileServer',
    'kickoffLocalCronServer',
    'kickoffLocalDeapServer',
    'kickoffLocalNemsServer',
    'kickoffLocalCmsServer',
    'kickoffLocalWorkflowServer'
];

localServers.forEach(serverName => {
    initializeConfiguration(serverName);
    assert.strictEqual(NODICS.getServerName(), serverName);
    assert.strictEqual(NODICS.getEnvironmentName(), 'kickoffEnvs');
    assert.strictEqual(NODICS.getServerRootName(), 'kickoffLocal');
    assert(NODICS.isModuleActive('gFramework'), 'gFramework should always be active for ' + serverName);
    assert(NODICS.isModuleActive(serverName), serverName + ' module should be active');
});

initializeConfiguration('kickoffLocalServer', 'kickoffLocalNode0');
assert.strictEqual(NODICS.getNodeName(), 'kickoffLocalNode0');
assert(NODICS.isModuleActive('kickoffLocalNode0'), 'selected node module should be active');

initializeConfiguration('kickoffLocalServer');
assert(NODICS.isModuleActive('profile'), 'consolidated local server should include profile');
assert.strictEqual(NODICS.getRawModule(NODICS.getEnvironmentName()).metaData.nodics.kind, 'group');
assert.strictEqual(NODICS.getRawModule(NODICS.getServerRootName()).metaData.nodics.kind, 'environment');
assert.strictEqual(NODICS.getRawModule(NODICS.getServerName()).metaData.nodics.kind, 'server');
initService.validateSelectedRuntimeKinds();
initService.validateSelectedRuntimeConfigurationFiles();
initService.validateRequiredModuleDependencies();

let serverProperties = CONFIG.getProperties();
assert(serverProperties.server.default, 'server.default should be available after environment/server merge');
assert(serverProperties.server.default.server.httpPort, 'server.default.server.httpPort should be defined');
initService.validateRuntimeTopologyConfiguration(serverProperties);

let loadOrder = initService.getConfigurationLoadOrder();
assert(loadOrder.includes('active module /config/properties.js files in module index order'));

assert.throws(() => {
    initService.validateModuleKind('profile', 'server', 'test module kind validation');
}, /must have nodics.kind server/);

assert.throws(() => {
    initService.validateRuntimeTopologyConfiguration({
        test: {
            runtimeTopology: {
                consolidatedServer: 'missingServer',
                modularServers: ['kickoffLocalProfileServer']
            }
        }
    });
}, /unknown module: missingServer/);

assert.throws(() => {
    initService.validateRuntimeTopologyConfiguration({
        test: {
            runtimeTopology: {
                consolidatedServer: 'kickoffLocalServer',
                modularServers: ['kickoffLocalProfileServer', 'kickoffLocalProfileServer']
            }
        }
    });
}, /duplicate server/);

assert.throws(() => {
    initService.validateConfiguredModules({
        activeModules: {
            groups: ['missingGroup'],
            modules: []
        }
    });
}, /unknown module: missingGroup/);

assert.throws(() => {
    initService.validateServerConfiguration({
        server: {}
    });
}, /server.default must be defined/);

assert.throws(() => {
    initService.validateModuleIndexOrder({
        name: 'applicationServer',
        index: '100.1.1'
    }, {
        name: 'applicationEnvironment',
        index: '100.1'
    }, 'server root to server');
}, /index order is invalid/);
