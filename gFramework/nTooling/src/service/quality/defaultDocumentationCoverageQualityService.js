/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module nTooling/service/quality/defaultDocumentationCoverageQualityService
 * @description Collects project-scoped source documentation coverage by module, layer, contract scope, test inclusion, and generated-artifact policy.
 * @layer tooling
 * @owner nTooling
 * @override Projects may replace or wrap the `docs:coverage` command while retaining explicit scope and failure semantics.
 */

const frameworkRootDir = path.resolve(__dirname, '../../../../..');

function readOption(args, name, defaultValue) {
    const prefix = name + '=';
    const match = args.find(arg => arg.indexOf(prefix) === 0);
    if (!match) {
        return defaultValue;
    }
    return match.slice(prefix.length);
}

function readCsvOption(args, name) {
    const value = readOption(args, name, '');
    if (!value) {
        return [];
    }
    return value.split(',').map(item => item.trim()).filter(Boolean);
}

const excludedDirs = new Set([
    '.git',
    'node_modules',
    'temp',
    'logs',
    'dist',
    'gen',
    'templates'
]);

const sourceLayers = new Set([
    'controller',
    'facade',
    'service',
    'router',
    'pipelines',
    'interceptors',
    'lib',
    'schemas',
    'utils'
]);

const runtimeLayers = new Set([
    'controller',
    'facade',
    'service',
    'router',
    'pipelines',
    'interceptors',
    'lib'
]);

const contractLayers = new Set([
    'schemas',
    'router'
]);

function isExcludedDirectory(fullPath, entryName, rootDir, includeGenerated) {
    if (path.relative(rootDir, fullPath) === 'docs') {
        return true;
    }
    return excludedDirs.has(entryName) && !(includeGenerated && entryName === 'gen');
}

function walk(dir, files, includeTests, includeGenerated, rootDir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        if (entry.name.startsWith('.')) {
            return;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (isExcludedDirectory(fullPath, entry.name, rootDir, includeGenerated)) {
                return;
            }
            if (!includeTests && entry.name === 'test') {
                return;
            }
            walk(fullPath, files, includeTests, includeGenerated, rootDir);
            return;
        }
        if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    });
}

function pathParts(filePath, coverageRootDir) {
    return relative(filePath, coverageRootDir).split(path.sep);
}

function getModuleName(filePath, coverageRootDir) {
    const parts = pathParts(filePath, coverageRootDir);
    if (parts.length < 2) {
        return '';
    }
    if (parts[1] && !['config', 'src', 'test', 'data', 'nodics.js'].includes(parts[1])) {
        return parts[1];
    }
    return parts[0];
}

function getLayer(filePath, coverageRootDir) {
    const parts = pathParts(filePath, coverageRootDir);
    const srcIndex = parts.indexOf('src');
    if (srcIndex >= 0 && parts[srcIndex + 1]) {
        return parts[srcIndex + 1];
    }
    if (parts.includes('config')) {
        return 'config';
    }
    if (parts.includes('test')) {
        return 'test';
    }
    if (parts.includes('data')) {
        return 'data';
    }
    if (parts[parts.length - 1] === 'nodics.js') {
        return 'module';
    }
    return 'unknown';
}

function isFrameworkCoreModule(moduleName) {
    return [
        'nConfig',
        'nCommon',
        'nDatabase',
        'nRouter',
        'nService',
        'nPipeline'
    ].includes(moduleName);
}

function isGeneratedRuntimeArtifact(filePath, coverageRootDir) {
    const parts = pathParts(filePath, coverageRootDir);
    const genIndex = parts.indexOf('gen');
    if (genIndex < 0 || !parts.includes('src')) {
        return false;
    }
    const srcIndex = parts.indexOf('src');
    const layer = parts[srcIndex + 1];
    return ['service', 'facade', 'controller'].includes(layer) && parts[genIndex - 1] === layer;
}

function matchesScope(filePath, options) {
    const parts = pathParts(filePath, options.rootDir);
    const layer = getLayer(filePath, options.rootDir);
    const moduleName = getModuleName(filePath, options.rootDir);

    if (options.moduleFilter.length > 0 && !options.moduleFilter.includes(moduleName)) {
        return false;
    }
    if (options.layerFilter.length > 0 && !options.layerFilter.includes(layer)) {
        return false;
    }

    if (options.scope === 'all') {
        return true;
    }
    if (options.scope === 'source') {
        return parts.includes('src') && sourceLayers.has(layer);
    }
    if (options.scope === 'runtime') {
        return parts.includes('src') && runtimeLayers.has(layer);
    }
    if (options.scope === 'contracts') {
        return (parts.includes('src') && contractLayers.has(layer)) || layer === 'config' || layer === 'module';
    }
    if (options.scope === 'framework-core') {
        return isFrameworkCoreModule(moduleName) && parts.includes('src') && runtimeLayers.has(layer);
    }
    if (options.scope === 'generated') {
        return isGeneratedRuntimeArtifact(filePath, options.rootDir);
    }
    throw new Error('Unknown documentation coverage scope: ' + options.scope);
}

function hasModuleDocumentation(content) {
    const exportIndex = content.indexOf('module.exports');
    if (exportIndex < 0) {
        return true;
    }
    const beforeExport = content.slice(0, exportIndex);
    const docBlocks = beforeExport.match(/\/\*\*[\s\S]*?\*\//g) || [];
    return docBlocks.some(block => block.includes('@module') || block.includes('@description'));
}

function hasGeneratedDocumentation(content) {
    const exportIndex = content.indexOf('module.exports');
    const header = exportIndex >= 0 ? content.slice(0, exportIndex) : content;
    return header.includes('@generated') &&
        header.includes('@module generated/') &&
        header.includes('@sourceTemplate') &&
        header.includes('@schema') &&
        header.includes('@override');
}

function maskComments(content) {
    return content.replace(/\/\*[\s\S]*?\*\//g, match => ' '.repeat(match.length))
        .replace(/\/\/[^\n\r]*/g, match => ' '.repeat(match.length));
}

function findExportedMethods(content) {
    const methods = [];
    const exportIndex = content.indexOf('module.exports');
    if (exportIndex < 0) {
        return methods;
    }

    const scanContent = maskComments(content);
    const methodPattern = /(?:^|\n)(\s*)([A-Za-z_$][\w$]*)\s*:\s*(?:async\s+)?function\s*\(/g;
    let match;
    while ((match = methodPattern.exec(scanContent)) !== null) {
        methods.push({
            name: match[2],
            index: match.index + match[0].indexOf(match[2])
        });
    }
    return methods;
}

function hasMethodDocumentation(content, methodIndex) {
    const beforeMethod = content.slice(Math.max(0, methodIndex - 2000), methodIndex);
    const lastDocStart = beforeMethod.lastIndexOf('/**');
    const lastDocEnd = beforeMethod.lastIndexOf('*/');
    if (lastDocStart < 0 || lastDocEnd < lastDocStart) {
        return false;
    }
    const betweenDocAndMethod = beforeMethod.slice(lastDocEnd + 2).trim();
    return betweenDocAndMethod.length === 0;
}

function relative(filePath, coverageRootDir) {
    return path.relative(coverageRootDir || frameworkRootDir, filePath);
}

function createOptions(args) {
    args = args || [];
    const configuredHome = readOption(args, '--home', process.env.NODICS_HOME || '');
    return {
        rootDir: configuredHome ? path.resolve(configuredHome) : process.cwd(),
        failOnMissing: args.includes('--fail'),
        includeTests: args.includes('--include-tests'),
        includeGenerated: args.includes('--include-generated') || readOption(args, '--scope', 'all') === 'generated',
        scope: readOption(args, '--scope', 'all'),
        moduleFilter: readCsvOption(args, '--module'),
        layerFilter: readCsvOption(args, '--layer'),
        reportLimit: Number(readOption(args, '--limit', '80'))
    };
}

function collectCoverage(options) {
    const files = [];
    walk(options.rootDir, files, options.includeTests, options.includeGenerated, options.rootDir);

    const report = {
        scope: options.scope,
        moduleFilter: options.moduleFilter,
        layerFilter: options.layerFilter,
        filesChecked: 0,
        filesMissingModuleDocs: [],
        methodsChecked: 0,
        methodsMissingDocs: []
    };

    files.forEach(filePath => {
        if (!matchesScope(filePath, options)) {
            return;
        }
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('module.exports')) {
            return;
        }

        report.filesChecked += 1;
        if (options.scope === 'generated') {
            if (!hasGeneratedDocumentation(content)) {
                report.filesMissingModuleDocs.push(relative(filePath, options.rootDir));
            }
            return;
        }
        if (!hasModuleDocumentation(content)) {
            report.filesMissingModuleDocs.push(relative(filePath, options.rootDir));
        }

        findExportedMethods(content).forEach(method => {
            report.methodsChecked += 1;
            if (!hasMethodDocumentation(content, method.index)) {
                report.methodsMissingDocs.push(relative(filePath, options.rootDir) + '#' + method.name);
            }
        });
    });

    return report;
}

function printReport(report, reportLimit) {
    console.log('Nodics documentation coverage');
    console.log('Scope                      : ' + report.scope);
    if (report.moduleFilter.length > 0) {
        console.log('Module filter              : ' + report.moduleFilter.join(', '));
    }
    if (report.layerFilter.length > 0) {
        console.log('Layer filter               : ' + report.layerFilter.join(', '));
    }
    console.log('Files checked              : ' + report.filesChecked);
    console.log('Undocumented files         : ' + report.filesMissingModuleDocs.length);
    console.log('Exported methods checked   : ' + report.methodsChecked);
    console.log('Methods without JSDoc      : ' + report.methodsMissingDocs.length);

    if (report.filesMissingModuleDocs.length > 0) {
        console.log('\nUndocumented files:');
        report.filesMissingModuleDocs.slice(0, reportLimit).forEach(item => console.log('  - ' + item));
        if (report.filesMissingModuleDocs.length > reportLimit) {
            console.log('  ... ' + (report.filesMissingModuleDocs.length - reportLimit) + ' more');
        }
    }

    if (report.methodsMissingDocs.length > 0) {
        console.log('\nExported methods without JSDoc:');
        report.methodsMissingDocs.slice(0, reportLimit).forEach(item => console.log('  - ' + item));
        if (report.methodsMissingDocs.length > reportLimit) {
            console.log('  ... ' + (report.methodsMissingDocs.length - reportLimit) + ' more');
        }
    }
}

function hasMissingDocumentation(report) {
    return report.filesMissingModuleDocs.length > 0 || report.methodsMissingDocs.length > 0;
}

function runCli(args) {
    const options = createOptions(args);
    const report = collectCoverage(options);
    printReport(report, options.reportLimit);
    if (options.failOnMissing && hasMissingDocumentation(report)) {
        process.exitCode = 1;
    }
}

if (require.main === module) {
    runCli(process.argv.slice(2));
}

module.exports = {
    collectCoverage: collectCoverage,
    createOptions: createOptions,
    hasMissingDocumentation: hasMissingDocumentation,
    printReport: printReport,
    runCli: runCli
};
