/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module nTooling/service/quality/defaultStructureComplianceQualityService
 * @description Audits Nodics module, project, environment, server, and node structure against the canonical structure matrix without mutating source files.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may replace or wrap audit rules through the standard service merge path while keeping report-only and fail-on-gap modes explicit.
 */

const requiredRootFiles = [
    'package.json',
    'nodics.js',
    'AGENTS.md',
    'README.md'
];

const requiredConfigFiles = [
    'config/properties.js',
    'config/prescripts.js',
    'config/postscripts.js'
];

const requiredLlmEntries = [
    'llm/README.md',
    'llm/contracts/README.md',
    'llm/examples/README.md'
];

const sourceRegistryFiles = {
    'src/event': ['listeners.js'],
    'src/pipelines': ['pipelines.js'],
    'src/router': ['routers.js', 'appConfig.js'],
    'src/schemas': ['schemas.js'],
    'src/search': ['indexes.js'],
    'src/interceptors': ['interceptors.js'],
    'src/utils': ['utils.js', 'enums.js', 'statusDefinitions.js']
};

const ownsToSourceDirectory = {
    event: 'src/event',
    pipeline: 'src/pipelines',
    router: 'src/router',
    schema: 'src/schemas',
    search: 'src/search',
    interceptor: 'src/interceptors',
    service: 'src/service',
    controller: 'src/controller',
    facade: 'src/facade',
    utility: 'src/utils'
};

const sourceDirectoryToOwns = Object.keys(ownsToSourceDirectory).reduce((index, ownsName) => {
    index[ownsToSourceDirectory[ownsName]] = ownsName;
    return index;
}, {});

const ignoredDirectories = new Set([
    '.git',
    '.idea',
    '.vscode',
    'node_modules',
    'logs',
    'temp',
    'tmp',
    'dist',
    'generated',
    'docs'
]);

function readOption(args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
}

function toPosix(filePath) {
    return filePath.split(path.sep).join('/');
}

function relative(rootDir, filePath) {
    return toPosix(path.relative(rootDir, filePath));
}

function exists(modulePath, relativePath) {
    return fs.existsSync(path.join(modulePath, relativePath));
}

function isModuleDirectory(directory) {
    return exists(directory, 'package.json') && exists(directory, 'nodics.js');
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function createOptions(args) {
    const configuredHome = readOption(args, '--home', process.env.NODICS_HOME || '');
    return {
        rootDir: configuredHome ? path.resolve(configuredHome) : process.cwd(),
        failOnGap: (args || []).includes('--fail'),
        reportLimit: Number(readOption(args, '--limit', '80')),
        includeInfo: (args || []).includes('--include-info'),
        includeRoot: (args || []).includes('--include-root')
    };
}

function shouldVisitDirectory(entry) {
    if (entry.name.startsWith('.')) {
        return false;
    }
    return !ignoredDirectories.has(entry.name);
}

function scanModules(rootDir, directory, modules, includeCurrent) {
    if (!fs.existsSync(directory)) {
        return modules;
    }
    if (includeCurrent && isModuleDirectory(directory)) {
        const packageJson = readJson(path.join(directory, 'package.json'));
        modules.push({
            path: directory,
            relativePath: relative(rootDir, directory),
            packageJson: packageJson
        });
    }
    fs.readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && shouldVisitDirectory(entry))
        .sort((left, right) => left.name.localeCompare(right.name))
        .forEach(entry => scanModules(rootDir, path.join(directory, entry.name), modules, true));
    return modules;
}

function createFinding(report, severity, moduleObject, code, message) {
    report.findings.push({
        severity: severity,
        module: moduleObject.relativePath,
        code: code,
        message: message
    });
}

function inferExpectedKind(moduleObject) {
    const parts = moduleObject.relativePath.split('/');
    const envsIndex = parts.indexOf('envs');
    if (envsIndex >= 0) {
        const depth = parts.length - envsIndex - 1;
        if (depth === 0 || depth === 1) {
            return 'group';
        }
        if (depth === 2) {
            return 'server';
        }
        return 'node';
    }
    return null;
}

function collectJavaScriptFiles(directory, files) {
    if (!fs.existsSync(directory)) {
        return files;
    }
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            collectJavaScriptFiles(entryPath, files);
        } else if (entry.name.endsWith('.js')) {
            files.push(entryPath);
        }
    });
    return files;
}

function validateRootFiles(report, moduleObject) {
    requiredRootFiles.forEach(relativePath => {
        if (!exists(moduleObject.path, relativePath)) {
            createFinding(report, 'error', moduleObject, 'missing-root-file',
                'Missing required root file `' + relativePath + '`.');
        }
    });
    requiredConfigFiles.forEach(relativePath => {
        if (!exists(moduleObject.path, relativePath)) {
            createFinding(report, 'error', moduleObject, 'missing-config-file',
                'Missing required configuration file `' + relativePath + '`.');
        }
    });
    requiredLlmEntries.forEach(relativePath => {
        if (!exists(moduleObject.path, relativePath)) {
            createFinding(report, 'warning', moduleObject, 'missing-llm-entry',
                'Missing recommended LLM guidance file `' + relativePath + '`.');
        }
    });
    if (!exists(moduleObject.path, 'docs/README.md')) {
        createFinding(report, 'warning', moduleObject, 'missing-docs-readme',
            'Missing module documentation entry `docs/README.md`.');
    }
}

function validateMetadata(report, moduleObject) {
    const packageJson = moduleObject.packageJson || {};
    const nodics = packageJson.nodics || {};
    if (packageJson.runtimeModule !== undefined) {
        createFinding(report, 'error', moduleObject, 'legacy-runtime-module',
            'Use `package.json.nodics.runtimeModule`; top-level `runtimeModule` is not authoritative.');
    }
    if (packageJson.tmpGroup !== undefined) {
        createFinding(report, 'error', moduleObject, 'obsolete-temporary-group',
            'Remove obsolete package metadata `tmpGroup`.');
    }
    if (nodics.backoffice !== undefined || nodics.description !== undefined) {
        createFinding(report, 'error', moduleObject, 'misplaced-package-value',
            'Runtime BackOffice configuration belongs in properties and package description belongs at top level.');
    }
    ['name', 'index', 'main', 'version', 'description', 'dependencies', 'nodics'].forEach(fieldName => {
        if (packageJson[fieldName] === undefined) {
            createFinding(report, 'error', moduleObject, 'missing-package-field',
                'Missing package metadata field `' + fieldName + '`.');
        }
    });
    ['kind', 'runtimeModule', 'loadableByNodicsModuleLoader', 'owns', 'runtime'].forEach(fieldName => {
        if (nodics[fieldName] === undefined) {
            createFinding(report, 'error', moduleObject, 'missing-nodics-field',
                'Missing package.json.nodics field `' + fieldName + '`.');
        }
    });
    if (packageJson.main && packageJson.main !== 'nodics.js') {
        createFinding(report, 'warning', moduleObject, 'nonstandard-main',
            'Standard module main should be `nodics.js`, found `' + packageJson.main + '`.');
    }
    const expectedKind = inferExpectedKind(moduleObject);
    if (expectedKind && nodics.kind && nodics.kind !== expectedKind) {
        createFinding(report, 'error', moduleObject, 'kind-mismatch',
            'Expected kind `' + expectedKind + '` from approved topology, found `' + nodics.kind + '`.');
    }
    if (nodics.kind === 'project' && !packageJson.groupName) {
        createFinding(report, 'error', moduleObject, 'missing-project-group-name',
            'Project package metadata must include `groupName`.');
    }
    if (nodics.owns !== undefined && !Array.isArray(nodics.owns)) {
        createFinding(report, 'error', moduleObject, 'invalid-owns',
            '`package.json.nodics.owns` must be an array.');
    }
}

function validateSourceStructure(report, moduleObject) {
    Object.keys(sourceRegistryFiles).forEach(relativeDirectory => {
        if (!exists(moduleObject.path, relativeDirectory)) {
            return;
        }
        sourceRegistryFiles[relativeDirectory].forEach(fileName => {
            if (!exists(moduleObject.path, path.join(relativeDirectory, fileName))) {
                createFinding(report, 'error', moduleObject, 'missing-source-registry',
                    '`' + relativeDirectory + '` must include `' + fileName + '`.');
            }
        });
    });

    ['src/service', 'src/controller', 'src/facade'].forEach(relativeDirectory => {
        const directory = path.join(moduleObject.path, relativeDirectory);
        const suffix = {
            'src/service': 'Service.js',
            'src/controller': 'Controller.js',
            'src/facade': 'Facade.js'
        }[relativeDirectory];
        collectJavaScriptFiles(directory, []).forEach(filePath => {
            const fileName = path.basename(filePath);
            const relativeFile = relative(moduleObject.path, filePath);
            if (relativeFile.includes('/gen/') || relativeFile.includes('/generated/') || fileName === 'common.js') {
                return;
            }
            if (!fileName.endsWith(suffix)) {
                createFinding(report, 'error', moduleObject, 'loader-invisible-file',
                    '`' + relativeFile + '` is under loader-managed `' + relativeDirectory +
                    '` but does not end with `' + suffix + '`.');
            }
        });
    });

    if (exists(moduleObject.path, 'src/router/router.js')) {
        createFinding(report, 'error', moduleObject, 'retired-router-file',
            'Use `src/router/routers.js`; `src/router/router.js` is retired.');
    }
    if (exists(moduleObject.path, 'src/pipelines/pipelinesDefinition.js')) {
        createFinding(report, 'error', moduleObject, 'retired-pipeline-file',
            'Use `src/pipelines/pipelines.js`; `src/pipelines/pipelinesDefinition.js` is retired.');
    }
}

function validateOwnershipAlignment(report, moduleObject) {
    const nodics = moduleObject.packageJson.nodics || {};
    const owns = new Set(Array.isArray(nodics.owns) ? nodics.owns : []);
    Object.keys(sourceDirectoryToOwns).forEach(relativeDirectory => {
        if (exists(moduleObject.path, relativeDirectory) && !owns.has(sourceDirectoryToOwns[relativeDirectory])) {
            createFinding(report, 'warning', moduleObject, 'owns-missing-source',
                '`' + relativeDirectory + '` exists but `nodics.owns` does not include `' +
                sourceDirectoryToOwns[relativeDirectory] + '`.');
        }
    });
    Object.keys(ownsToSourceDirectory).forEach(ownsName => {
        if (owns.has(ownsName) && exists(moduleObject.path, 'src') &&
            !exists(moduleObject.path, ownsToSourceDirectory[ownsName])) {
            createFinding(report, 'warning', moduleObject, 'owns-without-source',
                '`nodics.owns` includes `' + ownsName + '` but `' +
                ownsToSourceDirectory[ownsName] + '` does not exist.');
        }
    });
}

function validateBoundaryFolders(report, moduleObject) {
    const kind = ((moduleObject.packageJson.nodics || {}).kind);
    if (kind === 'project') {
        ['src', 'data', 'generated'].forEach(relativePath => {
            if (exists(moduleObject.path, relativePath)) {
                createFinding(report, 'warning', moduleObject, 'project-runtime-folder',
                    'Project root should not own empty or runtime folder `' + relativePath + '`.');
            }
        });
    }
    if (kind === 'group' && exists(moduleObject.path, 'data')) {
        const owns = new Set((moduleObject.packageJson.nodics || {}).owns || []);
        if (!owns.has('data')) {
            createFinding(report, 'warning', moduleObject, 'group-data-without-ownership',
                'Group module has `data/` but does not declare data ownership.');
        }
    }
}

function validateActivationPlacement(report, moduleObject) {
    const propertiesPath = path.join(moduleObject.path, 'config/properties.js');
    if (!fs.existsSync(propertiesPath)) {
        return;
    }
    const source = fs.readFileSync(propertiesPath, 'utf8');
    if (!/\bactiveModules\s*:/.test(source)) {
        return;
    }
    const kind = (moduleObject.packageJson.nodics || {}).kind;
    if (kind !== 'server') {
        createFinding(report, 'warning', moduleObject, 'active-modules-outside-server',
            '`activeModules` should normally belong to server `config/properties.js`.');
    }
}

function collectReport(options) {
    const modules = scanModules(options.rootDir, options.rootDir, [], options.includeRoot === true);
    const report = {
        rootDir: options.rootDir,
        modulesChecked: modules.length,
        findings: []
    };
    modules.forEach(moduleObject => {
        validateRootFiles(report, moduleObject);
        validateMetadata(report, moduleObject);
        validateSourceStructure(report, moduleObject);
        validateOwnershipAlignment(report, moduleObject);
        validateBoundaryFolders(report, moduleObject);
        validateActivationPlacement(report, moduleObject);
    });
    report.errorCount = report.findings.filter(finding => finding.severity === 'error').length;
    report.warningCount = report.findings.filter(finding => finding.severity === 'warning').length;
    if (!options.includeInfo) {
        report.findings = report.findings.filter(finding => finding.severity !== 'info');
    }
    return report;
}

function printReport(report, limit) {
    console.log('Nodics structure compliance audit');
    console.log('Modules checked       : ' + report.modulesChecked);
    console.log('Errors                : ' + report.errorCount);
    console.log('Warnings              : ' + report.warningCount);
    if (report.findings.length > 0) {
        console.log('\nFindings:');
        report.findings.slice(0, limit).forEach(finding => {
            console.log('  - [' + finding.severity + '] ' + finding.module + ' :: ' +
                finding.code + ' :: ' + finding.message);
        });
        if (report.findings.length > limit) {
            console.log('  ... ' + (report.findings.length - limit) + ' more');
        }
    }
}

function hasComplianceGaps(report) {
    return report.errorCount > 0 || report.warningCount > 0;
}

function runCli(args) {
    const options = createOptions(args || []);
    const report = collectReport(options);
    printReport(report, options.reportLimit);
    if (options.failOnGap && hasComplianceGaps(report)) {
        process.exitCode = 1;
    }
}

if (require.main === module) {
    runCli(process.argv.slice(2));
}

module.exports = {
    collectReport: collectReport,
    createOptions: createOptions,
    hasComplianceGaps: hasComplianceGaps,
    printReport: printReport,
    runCli: runCli
};
