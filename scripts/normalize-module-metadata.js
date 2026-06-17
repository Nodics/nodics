const fs = require('fs');
const path = require('path');

const {
    listFeatureFolders,
    scanModules
} = require('./module-llm-context-utils');

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

    if (relativePath === 'gSetup' || type === 'setup') {
        return 'setup';
    }
    if (relativePath.includes('/templates/')) {
        return 'template';
    }
    if (/(^|\/)(kickoff|gframes)Envs\/[^/]+\/[^/]+\/[^/]+$/.test(relativePath)) {
        return 'node';
    }
    if (/(^|\/)(kickoff|gframes)Envs\/[^/]+\/[^/]+$/.test(relativePath)) {
        return 'server';
    }
    if (/(^|\/)(kickoff|gframes)Envs\/[^/]+$/.test(relativePath)) {
        return 'environment';
    }
    if (relativePath.endsWith('Envs') || relativePath.endsWith('Modules')) {
        return 'group';
    }
    if (relativePath === 'kickoff' || relativePath === 'gframes') {
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

function inferModuleType(packageJson, kind) {
    if (packageJson.type === 'publish' || packageJson.type === 'web' || packageJson.type === 'router') {
        return packageJson.type;
    }
    if (['application', 'environment', 'server', 'node', 'template'].includes(kind)) {
        return kind;
    }
    if (kind === 'group') {
        return 'group';
    }
    return packageJson.type || 'core';
}

function inferOwns(module, kind) {
    if (kind === 'setup') {
        return ['llm'];
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
    let moduleType = inferModuleType(packageJson, kind);
    packageJson.nodics = Object.assign({}, packageJson.nodics || {}, {
        kind: kind,
        moduleType: moduleType,
        runtimeModule: packageJson.runtimeModule === false ? false : !(kind === 'setup'),
        loadableByNodicsModuleLoader: packageJson.runtimeModule === false ? false : !(kind === 'setup'),
        owns: inferOwns(module, kind)
    });
    if (kind === 'group') {
        packageJson.nodics.description = 'Container module that composes child modules and may contribute shared configuration.';
    } else if (kind === 'environment') {
        packageJson.nodics.description = 'Environment module that contributes environment-level configuration and topology.';
    } else if (kind === 'server') {
        packageJson.nodics.description = 'Server module that contributes server-level configuration and startup topology.';
    } else if (kind === 'node') {
        packageJson.nodics.description = 'Node module that contributes node-level configuration for distributed deployment.';
    } else if (kind === 'setup') {
        packageJson.nodics.description = 'Global LLM and setup guidance package, not loaded by the Nodics runtime module loader.';
    }
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4) + '\n', 'utf8');
}

function run() {
    let modules = scanModules();
    modules.forEach(normalizeModule);
    console.log('Normalized Nodics metadata for ' + modules.length + ' packages');
}

if (require.main === module) {
    run();
}

module.exports = {
    run,
    inferKind,
    inferModuleType,
    inferOwns
};
