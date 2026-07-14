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
 * @module nTooling/service/context/defaultNormalizeModuleMetadataService
 * @description Normalizes canonical package kind, runtime activation, loader eligibility, ownership, and topology descriptions across a target Nodics project.
 * @layer tooling
 * @owner nTooling
 * @override Projects may extend recognized package conventions through an explicit tooling command replacement rather than post-processing generated metadata.
 */

const {
    rootPath,
    listFeatureFolders,
    scanModules
} = require('./defaultModuleLlmContextUtilsService');

const generatedFolderToOwnership = {
    config: 'configuration',
    data: 'data',
    'src/schemas': 'schema',
    'src/router': 'router',
    'src/controller': 'controller',
    'src/facade': 'facade',
    'src/service': 'service',
    'src/pipelines': 'pipeline',
    'src/interceptors': 'interceptor',
    'src/event': 'event',
    'src/search': 'search',
    'src/service/tooling': 'tooling',
    'src/utils': 'utility',
    test: 'test'
};

function hasChildren(module) {
    let entries = fs.readdirSync(module.path, { withFileTypes: true });
    return entries.some(entry => {
        if (!entry.isDirectory()) {
            return false;
        }
        let childPath = path.join(module.path, entry.name);
        return fs.existsSync(path.join(childPath, 'package.json')) &&
            fs.existsSync(path.join(childPath, 'nodics.js'));
    });
}

function inferKind(module) {
    let relativePath = module.relativePath;
    let type = module.packageJson.type;
    let nodics = module.packageJson.nodics || {};

    if (nodics.kind) {
        return nodics.kind;
    }
    if (relativePath === '.') {
        return 'application';
    }
    if (relativePath === 'gSetup' || type === 'setup') {
        return 'setup';
    }
    if (relativePath === 'gFramework/nTooling') {
        return 'tooling';
    }
    if (relativePath.includes('/templates/')) {
        return 'template';
    }
    let pathParts = relativePath.split('/');
    let envGroupIndex = pathParts.findIndex(part => /Envs$/.test(part));
    if (envGroupIndex >= 0) {
        let hierarchyDepth = pathParts.length - envGroupIndex - 1;
        return ['group', 'group', 'server'][hierarchyDepth] || 'node';
    }
    if (relativePath.endsWith('Modules')) {
        return 'group';
    }
    if (pathParts.length === 1 && hasChildren(module)) {
        return 'application';
    }
    if (type === 'group' || (hasChildren(module) && !['router', 'publish', 'web'].includes(type))) {
        return 'group';
    }
    if (type === 'publish') {
        return 'publish';
    }
    if (type === 'web') {
        return 'web';
    }
    return 'capability';
}

function inferRuntime(packageJson, kind) {
    let currentRuntime = packageJson.nodics && packageJson.nodics.runtime ? packageJson.nodics.runtime : {};
    return Object.assign({}, currentRuntime, {
        router: currentRuntime.router === true || packageJson.type === 'router' || packageJson.type === 'web',
        publish: currentRuntime.publish === true || kind === 'publish' || packageJson.type === 'publish',
        web: currentRuntime.web === true || kind === 'web' || packageJson.type === 'web'
    });
}

function inferOwns(module, kind) {
    if (kind === 'setup') {
        return ['llm'];
    }
    if (kind === 'tooling') {
        return ['tooling', 'quality', 'configuration', 'test', 'llm'];
    }
    let owns = listFeatureFolders(module.path)
        .map(folder => generatedFolderToOwnership[folder])
        .filter(Boolean);
    if (hasChildren(module) && !owns.includes('composition')) {
        owns.unshift('composition');
    }
    if (!owns.includes('llm')) {
        owns.push('llm');
    }
    return Array.from(new Set(owns));
}

function normalizeModule(module) {
    let packagePath = path.join(module.path, 'package.json');
    let packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    let kind = inferKind(module);
    packageJson.nodics = Object.assign({}, packageJson.nodics || {}, {
        kind: kind,
        runtime: inferRuntime(packageJson, kind),
        runtimeModule: packageJson.runtimeModule === false ? false : !['setup', 'tooling'].includes(kind),
        loadableByNodicsModuleLoader: packageJson.runtimeModule === false ? false : !['setup', 'tooling'].includes(kind),
        owns: inferOwns(module, kind)
    });
    delete packageJson.nodics.moduleType;
    delete packageJson.type;
    if (kind === 'group') {
        packageJson.nodics.description = module.relativePath && /Envs[\\/]/.test(module.relativePath) ?
            'Environment group module that contributes deployment-wide configuration and contains server modules.' :
            'Container module that composes child modules and may contribute shared configuration.';
    } else if (kind === 'environment') {
        packageJson.nodics.description = 'Environment module that contributes environment-level configuration and topology.';
    } else if (kind === 'server') {
        packageJson.nodics.description = 'Server module that contributes server-level configuration and startup topology.';
    } else if (kind === 'node') {
        packageJson.nodics.description = 'Node module that contributes node-level configuration for distributed deployment.';
    } else if (kind === 'setup') {
        packageJson.nodics.description = 'Global LLM and setup guidance package, not loaded by the Nodics runtime module loader.';
    } else if (kind === 'tooling') {
        packageJson.nodics.description = 'Framework development and quality tooling package, not loaded by the Nodics runtime module loader.';
    }
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4) + '\n', 'utf8');
}

function run() {
    let rootPackage = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8'));
    let modules = [{
        name: rootPackage.name,
        index: rootPackage.index,
        path: rootPath,
        relativePath: '.',
        packageJson: rootPackage
    }].concat(scanModules());
    modules.forEach(normalizeModule);
    console.log('Normalized Nodics metadata for ' + modules.length + ' packages');
}

if (require.main === module) {
    run();
}

module.exports = {
    run,
    inferKind,
    inferRuntime,
    inferOwns
};
