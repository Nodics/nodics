/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

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
    'startioLocalServer',
    'startioLocalProfileServer',
    'startioLocalCronServer',
    'startioLocalDeapServer',
    'startioLocalNemsServer',
    'startioLocalCmsServer',
    'startioLocalWorkflowServer'
];

localServers.forEach(serverName => {
    initializeConfiguration(serverName);
    assert.strictEqual(NODICS.getServerName(), serverName);
    assert.strictEqual(NODICS.getEnvironmentName(), 'envs');
    assert.strictEqual(NODICS.getServerRootName(), 'startioLocal');
    assert(NODICS.isModuleActive('gFramework'), 'gFramework should always be active for ' + serverName);
    assert(NODICS.isModuleActive(serverName), serverName + ' module should be active');
});

initializeConfiguration('startioLocalServer', 'startioLocalNode0');
assert.strictEqual(NODICS.getNodeName(), 'startioLocalNode0');
assert(NODICS.isModuleActive('startioLocalNode0'), 'selected node module should be active');
assert.strictEqual(NODICS.getActiveModules().filter(moduleName => moduleName === 'startioLocalNode0').length, 1);
assert.deepStrictEqual(initService.getSelectedRuntimeModuleNames(), [
    'envs',
    'startioLocal',
    'startioLocalServer',
    'startioLocalNode0'
]);
let nodeServerProperties = initService.loadServerProperties();
let nodeConfiguredModules = nodeServerProperties.activeModules.modules.slice();
let configuredWithNode = initService.getConfiguredActiveModuleNames(nodeServerProperties);
assert.strictEqual(configuredWithNode.filter(moduleName => moduleName === 'startioLocalNode0').length, 1);
assert.deepStrictEqual(nodeServerProperties.activeModules.modules, nodeConfiguredModules);

initializeConfiguration('startioLocalServer');
assert(NODICS.isModuleActive('profile'), 'consolidated local server should include profile');
assert.strictEqual(NODICS.getRawModule(NODICS.getEnvironmentName()).metaData.nodics.kind, 'group');
assert.strictEqual(NODICS.getRawModule(NODICS.getServerRootName()).metaData.nodics.kind, 'group');
assert.strictEqual(NODICS.getRawModule(NODICS.getServerName()).metaData.nodics.kind, 'server');
initService.validateSelectedRuntimeKinds();
initService.validateSelectedRuntimeConfigurationFiles();
initService.validateRequiredModuleDependencies();

let serverProperties = CONFIG.getProperties();
assert(serverProperties.servers.default, 'servers.default should be available after environment/server merge');
assert(serverProperties.servers.default.endpoint.httpPort, 'servers.default.endpoint.httpPort should be defined');
assert(serverProperties.servers.default.abstractEndpoint.httpPort, 'servers.default.abstractEndpoint.httpPort should be defined');
assert.strictEqual(serverProperties.server, undefined, 'legacy singular server collection must not remain in effective configuration');
initService.validateRuntimeTopologyConfiguration(serverProperties);

let loadOrder = initService.getConfigurationLoadOrder();
assert(loadOrder.includes('active module /config/properties.js files in module index order'));

initializeConfiguration('startioLocalWorkflowServer');
assert(!NODICS.isModuleActive('profile'), 'workflow server should use profile remotely instead of activating it locally');
serverProperties = CONFIG.getProperties();
assert(initService.getConfiguredServerEndpointNames(serverProperties).includes('profile'));
assert(initService.getConfiguredRemoteModuleNames(serverProperties).includes('profile'));
assert(!NODICS.getActiveModules().includes('profile'), 'servers.profile endpoint coordinates must not activate profile locally');

assert.throws(() => {
    initService.validateModuleKind('profile', 'server', 'test module kind validation');
}, /must have nodics.kind server/);

assert.throws(() => {
    initService.validateRuntimeTopologyConfiguration({
        test: {
            runtimeTopology: {
                consolidatedServer: 'missingServer',
                modularServers: ['startioLocalProfileServer']
            }
        }
    });
}, /unknown module: missingServer/);

assert.throws(() => {
    initService.validateRuntimeTopologyConfiguration({
        test: {
            runtimeTopology: {
                consolidatedServer: 'startioLocalServer',
                modularServers: ['startioLocalProfileServer', 'startioLocalProfileServer']
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
        servers: {}
    });
}, /servers.default must be defined/);

assert.throws(() => {
    initService.validateServerConfiguration({
        servers: {
            default: {
                server: {
                    httpHost: 'localhost',
                    httpPort: 3000
                }
            }
        }
    });
}, /servers.default.endpoint must be defined/);

assert.throws(() => {
    initService.validateModuleIndexOrder({
        name: 'applicationServer',
        index: '100.1.1'
    }, {
        name: 'applicationEnvironment',
        index: '100.1'
    }, 'server root to server');
}, /index order is invalid/);

let originalGetEnvironmentName = NODICS.getEnvironmentName;
let originalGetRawModule = NODICS.getRawModule;
NODICS.getEnvironmentName = function () {
    return 'detachedRuntimeGroup';
};
NODICS.getRawModule = function (moduleName) {
    if (moduleName === 'detachedRuntimeGroup') {
        return {
            name: 'detachedRuntimeGroup',
            index: '100.0',
            parent: 'application',
            metaData: { name: 'detachedRuntimeGroup', nodics: { kind: 'group' } }
        };
    }
    return originalGetRawModule.call(NODICS, moduleName);
};
assert.throws(() => {
    initService.validateSelectedRuntimeHierarchy();
}, /must be a child of environment group detachedRuntimeGroup/);
NODICS.getEnvironmentName = originalGetEnvironmentName;
NODICS.getRawModule = originalGetRawModule;
