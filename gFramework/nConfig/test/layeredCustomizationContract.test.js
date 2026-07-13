/**
 * @module config/test/layeredCustomizationContract
 * @description Proves that a project-neutral framework, project, environment, server, and node hierarchy can customize configuration, schemas, routers, services, pipelines, facades, controllers, data, and tests before isolated tenant/runtime governance is applied.
 * @layer test
 * @owner nConfig
 * @override Projects may add capability-specific hierarchy scenarios, but this neutral contract must remain independent from bundled application names and preserve ordered traceability.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const _ = require('lodash');

const Config = require('../bin/config');
const fileLoader = require('../src/service/defaultFilesLoaderService');
const initializer = require('../src/service/DefaultFrameworkInitializerService');
const configUtils = require('../src/utils/utils');

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-layered-customization-'));
const layers = [
    { name: 'platformCapability', index: '1.0', role: 'framework', kind: 'capability', relativePath: 'framework/platformCapability' },
    { name: 'sampleProject', index: '100.0', role: 'project', kind: 'application', relativePath: 'sampleProject' },
    { name: 'sampleEnvironment', index: '100.1', role: 'environment', kind: 'environment', relativePath: 'sampleProject/sampleEnvironment' },
    { name: 'sampleServer', index: '100.1.1', role: 'server', kind: 'server', relativePath: 'sampleProject/sampleEnvironment/sampleServer' },
    { name: 'sampleNode', index: '100.1.1.1', role: 'node', kind: 'node', relativePath: 'sampleProject/sampleEnvironment/sampleServer/sampleNode' }
].map(layer => Object.assign({}, layer, {
    path: path.join(fixtureRoot, layer.relativePath)
}));

function writeContribution(layer, relativePath, value) {
    const filePath = path.join(layer.path, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, 'module.exports = ' + JSON.stringify(value, null, 4) + ';\n', 'utf8');
}

function writeJson(filePath, value) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(value, null, 4) + '\n', 'utf8');
}

function createLayerMarker(role) {
    const marker = {};
    marker[role] = true;
    return marker;
}

function createArtifact(role) {
    return Object.assign({
        capabilityContract: 'stable',
        implementationLayer: role
    }, createLayerMarker(role));
}

function createSchemaLayerMarker(role) {
    const marker = {};
    marker[role + 'Layer'] = {
        type: 'boolean',
        defaultValue: true
    };
    return marker;
}

layers.forEach(layer => {
    writeJson(path.join(layer.path, 'package.json'), {
        name: layer.name,
        index: layer.index,
        main: 'nodics.js',
        nodics: {
            kind: layer.kind,
            runtimeModule: true,
            loadableByNodicsModuleLoader: true,
            owns: ['configuration', 'schema', 'router', 'service', 'pipeline', 'data', 'test'],
            runtime: { router: false, publish: false, web: false }
        }
    });
    fs.writeFileSync(path.join(layer.path, 'nodics.js'), 'module.exports = {};\n', 'utf8');
    writeContribution(layer, 'config/properties.js', {
        hierarchyContract: Object.assign({
            capabilityContract: 'stable',
            implementationLayer: layer.role
        }, createLayerMarker(layer.role))
    });
    writeContribution(layer, 'config/prescripts.js', {});
    writeContribution(layer, 'config/postscripts.js', {});
    writeContribution(layer, 'data/hierarchy/data.js', {
        hierarchyData: Object.assign({ implementationLayer: layer.role }, createLayerMarker(layer.role))
    });
    writeContribution(layer, 'test/hierarchy/contribution.js', {
        hierarchyTest: Object.assign({ implementationLayer: layer.role }, createLayerMarker(layer.role))
    });
    const schemaContribution = {
        definition: Object.assign({
            implementationLayer: { type: 'string', defaultValue: layer.role }
        }, createSchemaLayerMarker(layer.role))
    };
    if (layer.role === 'framework') {
        schemaContribution.model = true;
        schemaContribution.definition.capabilityCode = { type: 'string', required: true };
    }
    writeContribution(layer, 'src/schemas/schemas.js', {
        hierarchy: {
            factoryItem: schemaContribution
        }
    });
    const routeContribution = {
        controller: 'Hierarchy' + layer.role + 'Controller',
        operation: 'execute' + layer.role,
        $override: { allowBreakingChanges: true }
    };
    if (layer.role === 'framework') {
        routeContribution.key = '/factory/items';
        routeContribution.method = 'POST';
        routeContribution.secured = true;
    }
    writeContribution(layer, 'src/router/router.js', {
        hierarchy: {
            factory: {
                execute: routeContribution
            }
        }
    });
    writeContribution(layer, 'src/service/defaultHierarchyProbeService.js', createArtifact(layer.role));
    writeContribution(layer, 'src/pipelines/hierarchyProbeDefinition.js', createArtifact(layer.role));
    writeContribution(layer, 'src/facade/defaultHierarchyProbeFacade.js', createArtifact(layer.role));
    writeContribution(layer, 'src/controller/defaultHierarchyProbeController.js', createArtifact(layer.role));
});

const discoveredModules = {};
configUtils.collectModulesList(fixtureRoot, discoveredModules);
const indexedModules = new Map(layers.map(layer => [layer.index, discoveredModules[layer.name]]));
const logConfiguration = {
    level: 'error',
    transports: {}
};

global.NODICS = {
    /** @returns {string} Root containing the isolated project-neutral module hierarchy. */
    getNodicsHome: function () {
        return fixtureRoot;
    },
    /** @returns {Map<string,Object>} Ordered discovered modules participating in the contract. */
    getIndexedModules: function () {
        return indexedModules;
    },
    /** @param {string} moduleName Runtime module name. @returns {Object|undefined} Discovered raw module metadata. */
    getRawModule: function (moduleName) {
        return discoveredModules[moduleName];
    },
    /** @returns {string} Selected server fixture path used by logger ownership. */
    getServerPath: function () {
        return layers[3].path;
    },
    /** @returns {string[]} Active tenant fixtures used by tenant-wide configuration changes. */
    getActiveTenants: function () {
        return ['tenantA', 'tenantB'];
    },
    /** @returns {void} Ignores logger registration in the isolated contract. */
    addLogger: function () {}
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};
global.CONFIG = new Config();
CONFIG.LOG = { error: function () {} };
CONFIG.setProperties({ log: logConfiguration });
global.UTILS = {
    /** @param {string} filePath Artifact file path. @returns {string} Artifact registry name. */
    getFileNameWithoutExtension: function (filePath) {
        return path.basename(filePath, path.extname(filePath));
    }
};
global.SERVICE = {};
global.PIPELINE = {};
global.FACADE = {};
global.CONTROLLER = {};

fileLoader.LOG = {
    /** @returns {void} Ignores expected fixture file-loading diagnostics. */
    debug: function () {},
    /** @returns {void} Ignores governed warnings explicitly allowed by the fixture. */
    warn: function () {}
};
initializer.LOG = {
    /** @returns {void} Ignores expected fixture artifact-loading diagnostics. */
    debug: function () {},
    /** @returns {void} Ignores governed warnings explicitly allowed by the fixture. */
    warn: function () {}
};

async function loadArtifacts() {
    for (const layer of layers) {
        const moduleObject = { name: layer.name, path: layer.path };
        await initializer.loadServices(moduleObject);
        await initializer.loadPipelinesDefinition(moduleObject);
        await initializer.loadFacades(moduleObject);
        await initializer.loadControllers(moduleObject);
    }
}

function assertLayeredArtifact(artifact, expectedLayer) {
    assert.strictEqual(artifact.capabilityContract, 'stable');
    assert.strictEqual(artifact.implementationLayer, expectedLayer);
    layers.forEach(layer => assert.strictEqual(artifact[layer.role], true));
    assert.deepStrictEqual(
        artifact.xNodics.overrideTrace.map(trace => trace.sourceModule),
        layers.map(layer => layer.name)
    );
}

(async function run() {
    try {
        assert.strictEqual(Object.keys(discoveredModules).length, layers.length);
        assert.strictEqual(discoveredModules.sampleEnvironment.parent, 'sampleProject');
        assert.strictEqual(discoveredModules.sampleServer.parent, 'sampleEnvironment');
        assert.strictEqual(discoveredModules.sampleNode.parent, 'sampleServer');
        assert.deepStrictEqual(
            configUtils.resolveModuleHiererchy('sampleNode', discoveredModules),
            ['sampleNode', 'sampleServer', 'sampleEnvironment', 'sampleProject']
        );
        assert.deepStrictEqual(
            initializer.sortModules(layers.map(layer => layer.index)),
            layers.map(layer => layer.index)
        );

        initializer.loadConfigurations();
        const properties = CONFIG.getProperties();
        assert.strictEqual(properties.hierarchyContract.capabilityContract, 'stable');
        assert.strictEqual(properties.hierarchyContract.implementationLayer, 'node');
        layers.forEach(layer => assert.strictEqual(properties.hierarchyContract[layer.role], true));

        const data = fileLoader.loadFiles('/data/hierarchy/data.js', {});
        const tests = fileLoader.loadFiles('/test/hierarchy/contribution.js', {});
        assert.strictEqual(data.hierarchyData.implementationLayer, 'node');
        assert.strictEqual(tests.hierarchyTest.implementationLayer, 'node');
        layers.forEach(layer => {
            assert.strictEqual(data.hierarchyData[layer.role], true);
            assert.strictEqual(tests.hierarchyTest[layer.role], true);
        });

        let schemas = fileLoader.loadSchemaFiles('/src/schemas/schemas.js', null);
        let routers = fileLoader.loadRouterFiles('/src/router/router.js', null);
        assert.strictEqual(schemas.hierarchy.factoryItem.definition.capabilityCode.required, true);
        assert.strictEqual(schemas.hierarchy.factoryItem.model, true);
        assert.strictEqual(schemas.hierarchy.factoryItem.definition.implementationLayer.defaultValue, 'node');
        layers.forEach(layer => {
            assert.strictEqual(schemas.hierarchy.factoryItem.definition[layer.role + 'Layer'].defaultValue, true);
        });
        assert.deepStrictEqual(
            schemas.hierarchy.factoryItem.xNodics.overrideTrace.map(trace => trace.sourceModule),
            layers.map(layer => layer.name)
        );
        assert.strictEqual(routers.hierarchy.factory.execute.controller, 'HierarchynodeController');
        assert.strictEqual(routers.hierarchy.factory.execute.key, '/factory/items');
        assert.strictEqual(routers.hierarchy.factory.execute.method, 'POST');
        assert.strictEqual(routers.hierarchy.factory.execute.secured, true);
        assert.deepStrictEqual(
            routers.hierarchy.factory.execute.xNodics.overrideTrace.map(trace => trace.sourceModule),
            layers.map(layer => layer.name)
        );

        schemas = fileLoader.mergeRuntimeSchemaFiles(schemas, {
            hierarchy: {
                factoryItem: {
                    definition: {
                        implementationLayer: { type: 'string', defaultValue: 'tenant-runtime' },
                        runtimeGoverned: { type: 'boolean', defaultValue: true }
                    },
                    $override: { allowBreakingChanges: true }
                }
            }
        }, 'tenantControlPlane', 'runtime:schemaConfiguration');
        routers = fileLoader.mergeRuntimeRouterFiles(routers, {
            hierarchy: {
                factory: {
                    execute: {
                        controller: 'RuntimeHierarchyController',
                        operation: 'executeRuntime',
                        $override: { allowBreakingChanges: true }
                    }
                }
            }
        }, 'tenantControlPlane', 'runtime:routerConfiguration');
        assert.strictEqual(schemas.hierarchy.factoryItem.definition.implementationLayer.defaultValue, 'tenant-runtime');
        assert.strictEqual(schemas.hierarchy.factoryItem.definition.runtimeGoverned.defaultValue, true);
        assert.strictEqual(schemas.hierarchy.factoryItem.xNodics.overrideTrace.length, 6);
        assert.strictEqual(schemas.hierarchy.factoryItem.xNodics.overrideTrace[5].sourceModule, 'tenantControlPlane');
        assert.strictEqual(schemas.hierarchy.factoryItem.xNodics.overrideTrace[5].source, 'runtime:schemaConfiguration');
        assert.strictEqual(routers.hierarchy.factory.execute.controller, 'RuntimeHierarchyController');
        assert.strictEqual(routers.hierarchy.factory.execute.xNodics.overrideTrace.length, 6);
        assert.strictEqual(routers.hierarchy.factory.execute.xNodics.overrideTrace[5].source, 'runtime:routerConfiguration');

        assert.throws(() => fileLoader.mergeRuntimeSchemaFiles(schemas, {
            hierarchy: {
                factoryItem: {
                    $override: { mode: 'unsafe-mode' }
                }
            }
        }, 'tenantControlPlane'), /Invalid schema override mode/);

        CONFIG.setProperties(_.merge({}, properties), 'tenantA');
        CONFIG.changeTenantProperties({
            hierarchyContract: {
                implementationLayer: 'tenant-runtime',
                tenantRuntime: true
            }
        }, 'tenantA');
        assert.strictEqual(CONFIG.get('hierarchyContract').implementationLayer, 'node');
        assert.strictEqual(CONFIG.get('hierarchyContract', 'tenantA').implementationLayer, 'tenant-runtime');
        assert.strictEqual(CONFIG.get('hierarchyContract', 'tenantA').tenantRuntime, true);
        CONFIG.setProperties(_.merge({}, properties), 'tenantB');
        CONFIG.changeTenantProperties({
            hierarchyContract: {
                implementationLayer: 'all-tenant-runtime',
                tenantWideRuntime: true
            }
        });
        assert.strictEqual(CONFIG.get('hierarchyContract').implementationLayer, 'node');
        assert.strictEqual(CONFIG.get('hierarchyContract', 'tenantA').implementationLayer, 'all-tenant-runtime');
        assert.strictEqual(CONFIG.get('hierarchyContract', 'tenantB').implementationLayer, 'all-tenant-runtime');
        assert.strictEqual(CONFIG.get('hierarchyContract', 'tenantB').tenantWideRuntime, true);

        await loadArtifacts();
        assertLayeredArtifact(SERVICE.defaultHierarchyProbeService, 'node');
        assertLayeredArtifact(PIPELINE.hierarchyProbeDefinition, 'node');
        assertLayeredArtifact(FACADE.defaultHierarchyProbeFacade, 'node');
        assertLayeredArtifact(CONTROLLER.defaultHierarchyProbeController, 'node');

        console.log('Project-neutral layered customization contract validated: ' + layers.length + ' layers plus tenant runtime');
    } finally {
        fs.rmSync(fixtureRoot, { recursive: true, force: true });
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
