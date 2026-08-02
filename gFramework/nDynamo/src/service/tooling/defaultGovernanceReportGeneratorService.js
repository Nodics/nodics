/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module nDynamo/service/tooling/defaultGovernanceReportGeneratorService
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

function readJsonIfExists(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function countFiles(directory, suffix) {
    let count = 0;
    scanDirectory(directory, suffix, () => {
        count += 1;
    });
    return count;
}

function normalizeModulePath(moduleObject) {
    return path.relative(projectRootDir, moduleObject.path).split(path.sep).join('/');
}

function extractReadmeMaturity(modulePath) {
    let readmePath = path.join(modulePath, 'README.md');
    if (!fs.existsSync(readmePath)) {
        return null;
    }
    let content = fs.readFileSync(readmePath, 'utf8');
    let match = content.match(/\*\*Maturity:\s*([^*]+)\*\*/i);
    return match ? match[1].trim() : null;
}

function inferMaturity(moduleObject, evidence) {
    if (evidence.readmeMaturity) {
        return evidence.readmeMaturity;
    }
    if (evidence.sourceFiles > 0 && evidence.testFiles > 0 && evidence.generatedTests > 0) {
        return 'implemented with generated contract evidence';
    }
    if (evidence.sourceFiles > 0 && evidence.testFiles > 0) {
        return 'implemented with focused test evidence';
    }
    if (evidence.sourceFiles > 0) {
        return 'source-present; test evidence incomplete';
    }
    if ((moduleObject.nodics && moduleObject.nodics.runtimeModule) === false) {
        return 'composition or metadata only';
    }
    return 'metadata-only; implementation evidence incomplete';
}

function collectDependencyPackages(ownedDependencies, modulePath) {
    return Object.keys(ownedDependencies || {}).filter(packageName => {
        let ownership = ownedDependencies[packageName] || {};
        return (ownership.owners || []).some(ownerPath => ownerPath === modulePath || ownerPath.startsWith(modulePath + '/'));
    }).map(packageName => ({
        packageName: packageName,
        type: ownedDependencies[packageName].type,
        restricted: ownedDependencies[packageName].restricted === true
    }));
}

function collectProviderCapabilityMaturitySummary(indexedModules, ownedDependencies) {
    return indexedModules.map(moduleObject => {
        let modulePath = normalizeModulePath(moduleObject);
        let packageJson = readJsonIfExists(path.join(moduleObject.path, 'package.json')) || {};
        let nodics = packageJson.nodics || {};
        let dependencyPackages = collectDependencyPackages(ownedDependencies, modulePath);
        let evidence = {
            readme: fs.existsSync(path.join(moduleObject.path, 'README.md')),
            readmeMaturity: extractReadmeMaturity(moduleObject.path),
            sourceFiles: countFiles(path.join(moduleObject.path, 'src'), '.js'),
            testFiles: countFiles(path.join(moduleObject.path, 'test'), '.test.js'),
            generatedTests: countFiles(path.join(moduleObject.path, 'test', 'gen'), '.test.js'),
            generatedContext: fs.existsSync(path.join(moduleObject.path, 'llm', 'generated', 'manifest.json')),
            dependencyPackages: dependencyPackages
        };
        return {
            moduleName: moduleObject.name,
            modulePath: modulePath,
            displayName: nodics.displayName || packageJson.description || moduleObject.name,
            kind: nodics.kind || 'unknown',
            activeRuntimeModule: nodics.runtimeModule !== false,
            runtime: nodics.runtime || {},
            owns: nodics.owns || [],
            providerBacked: dependencyPackages.length > 0 ||
                String(moduleObject.name).toLowerCase().includes('provider') ||
                (nodics.owns || []).includes('provider'),
            maturity: inferMaturity(moduleObject, evidence),
            evidence: evidence
        };
    }).sort((left, right) => left.modulePath.localeCompare(right.modulePath));
}

function collectArtifactSummary() {
    let layerDefinitions = [
        { layer: 'service', folder: 'src/service', suffix: 'Service.js' },
        { layer: 'facade', folder: 'src/facade', suffix: 'Facade.js' },
        { layer: 'controller', folder: 'src/controller', suffix: 'Controller.js' }
    ];
    let artifacts = {};
    function addArtifact(layer, name, moduleObject, filePath) {
        let key = layer + ':' + name;
        artifacts[key] = artifacts[key] || {
            name: name,
            layer: layer,
            contributions: []
        };
        artifacts[key].contributions.push({
            sourceModule: moduleObject.name,
            file: toRelative(filePath)
        });
    }
    NODICS.getIndexedModules().forEach(moduleObject => {
        layerDefinitions.forEach(layerDefinition => {
            let directory = path.join(moduleObject.path, layerDefinition.folder);
            scanDirectory(directory, layerDefinition.suffix, filePath => {
                let name = path.basename(filePath, '.js');
                addArtifact(layerDefinition.layer, name, moduleObject, filePath);
            });
        });
        let pipelineDirectory = path.join(moduleObject.path, 'src/pipelines');
        scanDirectory(pipelineDirectory, 'Definition.js', filePath => {
            addArtifact('pipeline', path.basename(filePath, '.js'), moduleObject, filePath);
        });
        let pipelineRegistryPath = path.join(pipelineDirectory, 'pipelines.js');
        if (fs.existsSync(pipelineRegistryPath)) {
            Object.keys(require(pipelineRegistryPath)).forEach(name => {
                addArtifact('pipeline', name, moduleObject, pipelineRegistryPath);
            });
        }
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
    let rawRouters = SERVICE.DefaultFilesLoaderService.loadRouterFiles('/src/router/routers.js');
    let schemas = collectSchemaSummary(rawSchema);
    let routes = collectRouterSummary(rawRouters);
    let artifacts = collectArtifactSummary();
    let generatedFiles = collectGeneratedSummary();
    let rootPackage = readJsonIfExists(path.join(projectRootDir, 'package.json')) || {};
    let ownedDependencies = rootPackage.nodics && rootPackage.nodics.dependencyGovernance ?
        rootPackage.nodics.dependencyGovernance.ownedDependencies || {} : {};
    let providerCapabilityMaturity = collectProviderCapabilityMaturitySummary(
        Array.from(NODICS.getIndexedModules().values()),
        ownedDependencies
    );
    let activeOutputModule = getActiveOutputModule();
    let report = {
        generatedAt: new Date().toISOString(),
        environmentName: NODICS.getSelectedEnvironmentName ? NODICS.getSelectedEnvironmentName() : NODICS.getEnvironmentName(),
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
            generatedFiles: generatedFiles.length,
            providerCapabilityMaturityEntries: providerCapabilityMaturity.length,
            providerBackedCapabilities: providerCapabilityMaturity.filter(entry => entry.providerBacked).length
        },
        schemas: schemas,
        routes: routes,
        artifacts: artifacts,
        generatedFiles: generatedFiles,
        providerCapabilityMaturity: providerCapabilityMaturity
    };

    let outputDirectory = path.join(activeOutputModule.path, 'generated', 'governance');
    fs.mkdirSync(outputDirectory, { recursive: true });
    let reportTargetName = NODICS.getNodeName() || activeOutputModule.name;
    let outputPath = path.join(outputDirectory, reportTargetName + '.governance-report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log('Generated governance report: ' + toRelative(outputPath));
    console.log('Schemas: ' + report.summary.schemas + ', Routes: ' + report.summary.routes + ', Artifacts: ' + report.summary.artifacts);
    console.log('Overrides - schema: ' + report.summary.schemaOverrides + ', route: ' + report.summary.routeOverrides + ', artifact: ' + report.summary.artifactOverrides);
    console.log('Provider/capability maturity entries: ' + report.summary.providerCapabilityMaturityEntries +
        ', provider-backed: ' + report.summary.providerBackedCapabilities);
}

/** Executes the governance report generator from the command line. */
function runCli() {
    run().catch(error => {
        console.error(error);
        process.exit(1);
    });
}

module.exports = {
    collectProviderCapabilityMaturitySummary: collectProviderCapabilityMaturitySummary,
    run: run,
    runCli: runCli
};

if (require.main === module) {
    runCli();
}
