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
 * @module nTooling/service/generation/defaultStructureGeneratorService
 * @description Generates contract-driven Nodics project, group, capability, environment, server, and node scaffolds from the canonical structure matrix.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may replace or wrap generation methods through the standard service merge path while preserving structure-audit compatibility.
 */

const copyrightHeader = `/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
`;

const runtimeFlags = {
    router: false,
    publish: false,
    web: false
};

const rootFiles = [
    'package.json',
    'nodics.js',
    'AGENTS.md',
    'README.md'
];

const configFiles = [
    'config/properties.js',
    'config/prescripts.js',
    'config/postscripts.js'
];

const docsFiles = [
    'docs/README.md',
    'llm/README.md',
    'llm/contracts/README.md',
    'llm/examples/README.md'
];

const registryFiles = {
    'src/event/listeners.js': 'Event listener registry for this boundary.',
    'src/pipelines/pipelines.js': 'Pipeline definition registry for this boundary.',
    'src/router/routers.js': 'Router definition registry for this boundary.',
    'src/router/appConfig.js': 'Router application configuration registry for this boundary.',
    'src/schemas/schemas.js': 'Schema definition registry for this boundary.',
    'src/search/indexes.js': 'Search index definition registry for this boundary.',
    'src/interceptors/interceptors.js': 'Interceptor definition registry for this boundary.',
    'src/utils/utils.js': 'Utility function registry for this boundary.',
    'src/utils/enums.js': 'Enum definition registry for this boundary.',
    'src/utils/statusDefinitions.js': 'Status and error definition registry for this boundary.'
};

const registryOwnership = {
    'src/event/listeners.js': 'event',
    'src/pipelines/pipelines.js': 'pipeline',
    'src/router/routers.js': 'router',
    'src/router/appConfig.js': 'router',
    'src/schemas/schemas.js': 'schema',
    'src/search/indexes.js': 'search',
    'src/interceptors/interceptors.js': 'interceptor',
    'src/utils/utils.js': 'utility',
    'src/utils/enums.js': 'utility',
    'src/utils/statusDefinitions.js': 'utility'
};

const sourceOwns = [
    'event',
    'pipeline',
    'router',
    'schema',
    'search',
    'interceptor',
    'service',
    'utility'
];

const defaultOwnsByKind = {
    project: ['composition', 'configuration', 'llm'],
    group: ['composition', 'configuration', 'llm'],
    capability: ['configuration'].concat(sourceOwns, ['test', 'llm']),
    provider: ['configuration', 'service', 'test', 'llm'],
    environment: ['composition', 'configuration', 'data', 'llm'],
    server: ['composition', 'configuration', 'router', 'service', 'pipeline', 'utility', 'test', 'llm'],
    node: ['configuration', 'router', 'service', 'pipeline', 'interceptor', 'utility', 'test', 'llm']
};

const nodicsKindByGenerationKind = {
    project: 'project',
    group: 'group',
    capability: 'capability',
    provider: 'capability',
    environment: 'group',
    server: 'server',
    node: 'node'
};

function readOption(args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
}

function toPosix(filePath) {
    return filePath.split(path.sep).join('/');
}

function ensureDirectory(directory) {
    fs.mkdirSync(directory, { recursive: true });
}

function writeFile(filePath, content) {
    ensureDirectory(path.dirname(filePath));
    fs.writeFileSync(filePath, content, 'utf8');
}

function blankObjectFile(modulePath, description) {
    return copyrightHeader + '\n' +
        '/**\n' +
        ' * @module ' + modulePath + '\n' +
        ' * @description ' + description + '\n' +
        ' * @layer definition\n' +
        ' * @owner generated\n' +
        ' * @override Later active modules may extend or replace this registry through Nodics layering.\n' +
        ' */\n' +
        'module.exports = {\n' +
        '\n' +
        '};\n';
}

function lifecycleFile(moduleName, layer) {
    return copyrightHeader + '\n' +
        '/**\n' +
        ' * @module ' + moduleName + '/' + layer + '\n' +
        ' * @description Defines generated ' + layer + ' startup extension declarations for ' + moduleName + '.\n' +
        ' * @layer config\n' +
        ' * @owner generated\n' +
        ' * @override Later active modules may override these declarations through configuration layering.\n' +
        ' */\n' +
        'module.exports = {\n' +
        '\n' +
        '};\n';
}

function propertiesFile(moduleName) {
    return copyrightHeader + '\n' +
        '/**\n' +
        ' * @module ' + moduleName + '/config/properties\n' +
        ' * @description Defines generated configurable defaults for ' + moduleName + '.\n' +
        ' * @layer config\n' +
        ' * @owner generated\n' +
        ' * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.\n' +
        ' */\n' +
        'module.exports = {\n' +
        '\n' +
        '};\n';
}

function nodicsFile(moduleName) {
    return copyrightHeader + '\n' +
        '/**\n' +
        ' * @module ' + moduleName + '\n' +
        ' * @description Generated Nodics lifecycle entrypoint for ' + moduleName + '.\n' +
        ' * @layer module\n' +
        ' * @owner generated\n' +
        ' * @override Later active modules may override lifecycle behavior without modifying this generated boundary.\n' +
        ' */\n' +
        'module.exports = {\n' +
        '    /**\n' +
        '     * Initializes this module boundary.\n' +
        '     * @param {Object} options Startup options.\n' +
        '     * @returns {Promise<boolean>} Resolves when initialization completes.\n' +
        '     */\n' +
        '    init: function (options) {\n' +
        '        return Promise.resolve(true);\n' +
        '    },\n' +
        '\n' +
        '    /**\n' +
        '     * Finalizes this module boundary.\n' +
        '     * @param {Object} options Startup options.\n' +
        '     * @returns {Promise<boolean>} Resolves when post-initialization completes.\n' +
        '     */\n' +
        '    postInit: function (options) {\n' +
        '        return Promise.resolve(true);\n' +
        '    }\n' +
        '};\n';
}

function defaultSampleService(moduleName) {
    return copyrightHeader + '\n' +
        '/**\n' +
        ' * @module ' + moduleName + '/src/service/defaultSampleService\n' +
        ' * @description Implements generated sample service lifecycle behavior and documents the standard service override shape.\n' +
        ' * @layer service\n' +
        ' * @owner generated\n' +
        ' * @override Later active modules may override these methods through the standard service merge path.\n' +
        ' */\n' +
        'module.exports = {\n' +
        '    /**\n' +
        '     * Initializes the sample service.\n' +
        '     * @param {Object} options Startup options.\n' +
        '     * @returns {Promise<boolean>} Resolves when initialization completes.\n' +
        '     */\n' +
        '    init: function (options) {\n' +
        '        return Promise.resolve(true);\n' +
        '    },\n' +
        '\n' +
        '    /**\n' +
        '     * Finalizes the sample service.\n' +
        '     * @param {Object} options Startup options.\n' +
        '     * @returns {Promise<boolean>} Resolves when post-initialization completes.\n' +
        '     */\n' +
        '    postInit: function (options) {\n' +
        '        return Promise.resolve(true);\n' +
        '    }\n' +
        '};\n';
}

function readme(title, description) {
    return '# ' + title + '\n\n' + description + '\n';
}

function parseList(value, defaultValue) {
    if (!value) {
        return defaultValue;
    }
    return value.split(',').map(item => item.trim()).filter(Boolean);
}

module.exports = {
    /**
     * Parses command-line arguments into generator options.
     * @param {string[]} args Command arguments.
     * @returns {Object} Generator options.
     */
    createOptions: function (args) {
        const kind = readOption(args, '--kind', 'capability');
        const name = readOption(args, '--name', '');
        const targetPath = readOption(args, '--path', name);
        return {
            kind: kind,
            name: name,
            targetPath: targetPath ? path.resolve(process.cwd(), targetPath) : '',
            index: readOption(args, '--index', '9000.0'),
            groupName: readOption(args, '--groupName', ''),
            description: readOption(args, '--description', ''),
            owns: parseList(readOption(args, '--owns', ''), defaultOwnsByKind[kind] || defaultOwnsByKind.capability),
            withSource: !args.includes('--no-src') && ['capability', 'provider', 'server', 'node'].includes(kind),
            withData: args.includes('--with-data') || ['environment'].includes(kind),
            withTest: !args.includes('--no-test') && ['capability', 'provider', 'server', 'node'].includes(kind)
        };
    },

    /**
     * Validates generator options before writing files.
     * @param {Object} options Generator options.
     * @returns {boolean} True when options are valid.
     */
    validateOptions: function (options) {
        if (!options.name || !/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
            throw new Error('A valid --name=<RuntimeName> is required.');
        }
        if (!nodicsKindByGenerationKind[options.kind]) {
            throw new Error('Unsupported --kind=' + options.kind);
        }
        if (!options.targetPath) {
            throw new Error('A target --path=<directory> is required.');
        }
        if (fs.existsSync(path.join(options.targetPath, 'package.json')) ||
            fs.existsSync(path.join(options.targetPath, 'nodics.js'))) {
            throw new Error('Target path already exists: ' + options.targetPath);
        }
        if (fs.existsSync(options.targetPath) && fs.readdirSync(options.targetPath).length > 0) {
            throw new Error('Target path is not empty: ' + options.targetPath);
        }
        if (options.kind === 'project' && !options.groupName) {
            throw new Error('Project generation requires --groupName=<companyOrProjectGroup>.');
        }
        return true;
    },

    /**
     * Builds package metadata for a generated boundary.
     * @param {Object} options Generator options.
     * @returns {Object} package.json content.
     */
    createPackageJson: function (options) {
        const packageJson = {
            name: options.name,
            index: options.index,
            description: options.description || 'Generated Nodics ' + options.kind + ' boundary.',
            main: 'nodics.js',
            version: '0.0.1',
            private: true,
            license: 'GPL-3.0-or-later',
            nodics: {
                kind: nodicsKindByGenerationKind[options.kind],
                runtimeModule: true,
                loadableByNodicsModuleLoader: true,
                owns: options.owns,
                description: options.description || 'Generated Nodics ' + options.kind + ' boundary.',
                runtime: Object.assign({}, runtimeFlags)
            },
            scripts: {},
            dependencies: {}
        };
        if (options.kind === 'project') {
            packageJson.groupName = options.groupName;
        }
        return packageJson;
    },

    /**
     * Writes standard root, configuration, docs, LLM, source, data, and test files.
     * @param {Object} options Generator options.
     * @returns {Object} Generation summary.
     */
    generate: function (options) {
        this.validateOptions(options);
        ensureDirectory(options.targetPath);
        writeFile(path.join(options.targetPath, 'package.json'), JSON.stringify(this.createPackageJson(options), null, 4) + '\n');
        writeFile(path.join(options.targetPath, 'nodics.js'), nodicsFile(options.name));
        writeFile(path.join(options.targetPath, 'AGENTS.md'), readme(options.name + ' Agents', 'Follow Nodics structure, layering, override, documentation, and test contracts inside this boundary.'));
        writeFile(path.join(options.targetPath, 'README.md'), readme(options.name, options.description || 'Generated Nodics ' + options.kind + ' boundary.'));
        configFiles.forEach(relativePath => {
            const content = relativePath.endsWith('properties.js') ?
                propertiesFile(options.name) :
                lifecycleFile(options.name, relativePath.replace('.js', ''));
            writeFile(path.join(options.targetPath, relativePath), content);
        });
        docsFiles.forEach(relativePath => {
            writeFile(path.join(options.targetPath, relativePath), readme(options.name + ' ' + path.basename(path.dirname(relativePath)), 'Generated documentation entry for ' + options.name + '.'));
        });
        ensureDirectory(path.join(options.targetPath, 'llm/generated'));
        if (options.kind === 'project') {
            ensureDirectory(path.join(options.targetPath, 'modules'));
            ensureDirectory(path.join(options.targetPath, 'envs'));
        }
        if (options.withSource) {
            const owns = new Set(options.owns);
            Object.keys(registryFiles).forEach(relativePath => {
                if (!owns.has(registryOwnership[relativePath])) {
                    return;
                }
                writeFile(path.join(options.targetPath, relativePath),
                    blankObjectFile(options.name + '/' + toPosix(relativePath).replace(/\.js$/, ''), registryFiles[relativePath]));
            });
            if (owns.has('service')) {
                writeFile(path.join(options.targetPath, 'src/service/defaultSampleService.js'), defaultSampleService(options.name));
            }
        }
        if (options.withData) {
            ensureDirectory(path.join(options.targetPath, 'data/init'));
            ensureDirectory(path.join(options.targetPath, 'data/core'));
            ensureDirectory(path.join(options.targetPath, 'data/sample'));
        }
        if (options.withTest) {
            ensureDirectory(path.join(options.targetPath, 'test'));
        }
        return {
            name: options.name,
            kind: options.kind,
            path: options.targetPath,
            files: rootFiles.concat(configFiles, docsFiles)
        };
    },

    /**
     * Runs the generator from command-line arguments.
     * @param {string[]} args Command arguments.
     * @returns {void}
     */
    runCli: function (args) {
        const options = this.createOptions(args || []);
        const result = this.generate(options);
        console.log('Generated Nodics ' + result.kind + ' boundary: ' + result.name);
        console.log('Path: ' + result.path);
    }
};

if (require.main === module) {
    module.exports.runCli(process.argv.slice(2));
}
