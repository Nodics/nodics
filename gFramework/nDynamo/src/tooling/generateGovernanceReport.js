const fs = require('fs');
const path = require('path');

/**
 * @module nDynamo/tooling/generateGovernanceReport
 * @description Generates a server-owned report of effective schema, router, artifact, generated-file, warning, and override traceability state.
 * @layer tooling
 * @owner nDynamo
 * @override Projects may explicitly replace the `governance:report` command or extend governed runtime definitions through the standard module hierarchy.
 */

const projectRootDir = path.resolve(process.env.NODICS_HOME || process.cwd());
const frameworkRootDir = path.resolve(__dirname, '../../../..');
const runtimeRootDir = fs.existsSync(path.join(projectRootDir, 'gFramework', 'nConfig')) ? projectRootDir : frameworkRootDir;
const config = require(path.join(runtimeRootDir, 'gFramework', 'nConfig'));
const env = require(path.join(runtimeRootDir, 'env'));

function toRelative(filePath) {
    if (!filePath) {
        return undefined;
    }
    return filePath.replace(NODICS.getNodicsHome(), '.');
}

function getActiveOutputModule() {
    let moduleName = NODICS.getServerName && NODICS.getServerName();
    let moduleObject = moduleName ? NODICS.getRawModule(moduleName) : null;
    if (!moduleObject || !moduleObject.path) {
        throw new Error('Active server module is required to generate governance report');
    }
    return {
        name: moduleName,
        path: moduleObject.path
    };
}

function collectSchemaSummary(rawSchema) {
    let schemas = [];
    Object.keys(rawSchema || {}).forEach(moduleName => {
        Object.keys(rawSchema[moduleName] || {}).forEach(schemaName => {
            let schema = rawSchema[moduleName][schemaName] || {};
            let trace = schema.xNodics && schema.xNodics.overrideTrace ? schema.xNodics.overrideTrace : [];
            schemas.push({
                moduleName: moduleName,
                schemaName: schemaName,
                properties: Object.keys(schema.definition || {}),
                trace: trace,
                finalSourceModule: trace.length ? trace[trace.length - 1].sourceModule : undefined,
                overridden: trace.length > 1,
                warnings: trace.reduce((warnings, item) => warnings.concat(item.warnings || []), [])
            });
        });
    });
    return schemas;
}

function collectRouterSummary(rawRouters) {
    let routes = [];
    Object.keys(rawRouters || {}).forEach(moduleName => {
        Object.keys(rawRouters[moduleName] || {}).forEach(groupName => {
            Object.keys(rawRouters[moduleName][groupName] || {}).forEach(routeName => {
                let route = rawRouters[moduleName][groupName][routeName] || {};
                if (!route || routeName === 'xNodics') {
                    return;
                }
                let trace = route.xNodics && route.xNodics.overrideTrace ? route.xNodics.overrideTrace : [];
                routes.push({
                    moduleName: moduleName,
                    groupName: groupName,
                    routeName: routeName,
                    key: route.key,
                    method: route.method,
                    controller: route.controller,
                    operation: route.operation,
                    secured: route.secured,
                    accessGroups: route.accessGroups,
                    trace: trace,
                    finalSourceModule: trace.length ? trace[trace.length - 1].sourceModule : undefined,
                    overridden: trace.length > 1,
                    warnings: trace.reduce((warnings, item) => warnings.concat(item.warnings || []), [])
                });
            });
        });
    });
    return routes;
}

function scanDirectory(directory, suffix, callback) {
    if (!fs.existsSync(directory)) {
        return;
    }
    fs.readdirSync(directory).forEach(entry => {
        let filePath = path.join(directory, entry);
        let stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            scanDirectory(filePath, suffix, callback);
        } else if (stat.isFile() && filePath.endsWith(suffix)) {
            callback(filePath);
        }
    });
}

function collectArtifactSummary() {
    let layerDefinitions = [
        { layer: 'service', folder: 'src/service', suffix: 'Service.js' },
        { layer: 'facade', folder: 'src/facade', suffix: 'Facade.js' },
        { layer: 'controller', folder: 'src/controller', suffix: 'Controller.js' },
        { layer: 'pipeline', folder: 'src/pipelines', suffix: 'Definition.js' }
    ];
    let artifacts = {};
    NODICS.getIndexedModules().forEach(moduleObject => {
        layerDefinitions.forEach(layerDefinition => {
            let directory = path.join(moduleObject.path, layerDefinition.folder);
            scanDirectory(directory, layerDefinition.suffix, filePath => {
                let name = path.basename(filePath, '.js');
                let key = layerDefinition.layer + ':' + name;
                artifacts[key] = artifacts[key] || {
                    name: name,
                    layer: layerDefinition.layer,
                    contributions: []
                };
                artifacts[key].contributions.push({
                    sourceModule: moduleObject.name,
                    file: toRelative(filePath)
                });
            });
        });
    });
    return Object.keys(artifacts).sort().map(key => {
        let artifact = artifacts[key];
        artifact.finalSourceModule = artifact.contributions.length ?
            artifact.contributions[artifact.contributions.length - 1].sourceModule : undefined;
        artifact.overridden = artifact.contributions.length > 1;
        return artifact;
    });
}

function collectGeneratedSummary() {
    let generatedFiles = [];
    NODICS.getIndexedModules().forEach(moduleObject => {
        ['src/service/gen', 'src/facade/gen', 'src/controller/gen', 'test/gen'].forEach(relativePath => {
            let directory = path.join(moduleObject.path, relativePath);
            scanDirectory(directory, '.js', filePath => {
                generatedFiles.push({
                    sourceModule: moduleObject.name,
                    file: toRelative(filePath)
                });
            });
        });
    });
    return generatedFiles;
}

async function initialize() {
    let options = env.defaultOptions;
    await config.prepareBuild(options);
    await config.initUtilities(options);
    await config.loadModules();
}

async function run() {
    await initialize();
    let rawSchema = SERVICE.DefaultFilesLoaderService.loadSchemaFiles('/src/schemas/schemas.js', null);
    let rawRouters = SERVICE.DefaultFilesLoaderService.loadRouterFiles('/src/router/router.js');
    let schemas = collectSchemaSummary(rawSchema);
    let routes = collectRouterSummary(rawRouters);
    let artifacts = collectArtifactSummary();
    let generatedFiles = collectGeneratedSummary();
    let activeOutputModule = getActiveOutputModule();
    let report = {
        generatedAt: new Date().toISOString(),
        environmentName: NODICS.getEnvironmentName(),
        serverRootName: NODICS.getServerRootName(),
        serverName: NODICS.getServerName(),
        nodeName: NODICS.getNodeName(),
        activeOutputModule: activeOutputModule.name,
        activeRuntimeTarget: NODICS.getNodeName() || activeOutputModule.name,
        activeModules: NODICS.getActiveModules(),
        indexedModules: Array.from(NODICS.getIndexedModules().values()).map(moduleObject => ({
            name: moduleObject.name,
            index: moduleObject.index,
            parent: moduleObject.parent,
            path: toRelative(moduleObject.path)
        })),
        summary: {
            schemas: schemas.length,
            schemaOverrides: schemas.filter(schema => schema.overridden).length,
            schemaWarnings: schemas.reduce((count, schema) => count + schema.warnings.length, 0),
            routes: routes.length,
            routeOverrides: routes.filter(route => route.overridden).length,
            routeWarnings: routes.reduce((count, route) => count + route.warnings.length, 0),
            artifacts: artifacts.length,
            artifactOverrides: artifacts.filter(artifact => artifact.overridden).length,
            generatedFiles: generatedFiles.length
        },
        schemas: schemas,
        routes: routes,
        artifacts: artifacts,
        generatedFiles: generatedFiles
    };

    let outputDirectory = path.join(activeOutputModule.path, 'generated', 'governance');
    fs.mkdirSync(outputDirectory, { recursive: true });
    let reportTargetName = NODICS.getNodeName() || activeOutputModule.name;
    let outputPath = path.join(outputDirectory, reportTargetName + '.governance-report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log('Generated governance report: ' + toRelative(outputPath));
    console.log('Schemas: ' + report.summary.schemas + ', Routes: ' + report.summary.routes + ', Artifacts: ' + report.summary.artifacts);
    console.log('Overrides - schema: ' + report.summary.schemaOverrides + ', route: ' + report.summary.routeOverrides + ', artifact: ' + report.summary.artifactOverrides);
}

run().catch(error => {
    console.error(error);
    process.exit(1);
});
