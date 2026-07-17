/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/moduleStructure
 * @description Enforces mandatory configuration files, canonical README naming, safe runtime identifiers, and explicit framework-folder naming across all Nodics modules.
 * @layer test
 * @owner nTooling
 * @override New module kinds may extend explicit naming exemptions without weakening runtime identity or mandatory structure validation.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { scanModules, getModuleKind } = require('../src/service/context/defaultModuleLlmContextUtilsService');
const { inferKind } = require('../src/service/context/defaultNormalizeModuleMetadataService');

const requiredConfigFiles = [
    'config/properties.js',
    'config/prescripts.js',
    'config/postscripts.js'
];
const standardSourceDirectories = new Set([
    'event',
    'lib',
    'pipelines',
    'router',
    'schemas',
    'search',
    'interceptors',
    'service',
    'controller',
    'facade',
    'utils',
    'gen',
    'generated'
]);
const sourceDefinitionFiles = {
    'src/event': ['listeners.js'],
    'src/pipelines': ['pipelines.js'],
    'src/router': ['routers.js', 'appConfig.js'],
    'src/schemas': ['schemas.js'],
    'src/search': ['indexes.js'],
    'src/interceptors': ['interceptors.js'],
    'src/utils': ['utils.js', 'enums.js', 'statusDefinitions.js']
};
const loaderManagedSource = {
    'src/service': {
        suffix: 'Service.js',
        loader: 'SERVICE'
    },
    'src/controller': {
        suffix: 'Controller.js',
        loader: 'CONTROLLER'
    },
    'src/facade': {
        suffix: 'Facade.js',
        loader: 'FACADE'
    }
};
const generationTemplateNames = new Set(['common.js']);
const runtimeNames = new Map();
const modules = scanModules();

modules.forEach(moduleObject => {
    const packageJson = moduleObject.packageJson;
    const nodics = packageJson.nodics || {};
    const folderName = path.basename(moduleObject.path);
    requiredConfigFiles.forEach(relativePath => {
        const configPath = path.join(moduleObject.path, relativePath);
        assert(fs.existsSync(configPath),
            'Missing mandatory module configuration file: ' + moduleObject.relativePath + '/' + relativePath);
        assert(/module\.exports\s*=/.test(fs.readFileSync(configPath, 'utf8')),
            'Mandatory configuration file must export its contribution: ' + moduleObject.relativePath + '/' + relativePath);
    });

    const readmes = fs.readdirSync(moduleObject.path).filter(name => /^readme\.md$/i.test(name));
    assert.deepStrictEqual(readmes, ['README.md'],
        'Module must contain exactly one canonical README.md: ' + moduleObject.relativePath);

    assert(/^[A-Za-z][A-Za-z0-9]*$/.test(packageJson.name),
        'Invalid package runtime name: ' + moduleObject.relativePath + ' -> ' + packageJson.name);

    if (nodics.kind !== 'template') {
        const matchesFolder = folderName === packageJson.name;
        const matchesFrameworkNamespace = folderName.toLowerCase() === ('n' + packageJson.name).toLowerCase();
        assert(matchesFolder || matchesFrameworkNamespace,
            'Folder must match runtime name or n-prefixed framework convention: ' + moduleObject.relativePath);
    }

    if (nodics.runtimeModule !== false && nodics.kind !== 'template') {
        assert(!runtimeNames.has(packageJson.name),
            'Duplicate runtime module name `' + packageJson.name + '` in ' +
            runtimeNames.get(packageJson.name) + ' and ' + moduleObject.relativePath);
        runtimeNames.set(packageJson.name, moduleObject.relativePath);
    }

    validateLoaderManagedSource(moduleObject);
    validateStandardSourceStructure(moduleObject);
});

const customHierarchyFixtures = [
    { relativePath: 'acme/acmeEnvs', expectedKind: 'group' },
    { relativePath: 'acme/acmeEnvs/development', expectedKind: 'group' },
    { relativePath: 'acme/acmeEnvs/development/acmeServer', expectedKind: 'server' },
    { relativePath: 'acme/acmeEnvs/development/acmeServer/acmeNode', expectedKind: 'node' }
];
customHierarchyFixtures.forEach(fixture => {
    const moduleObject = {
        name: path.basename(fixture.relativePath),
        relativePath: fixture.relativePath,
        path: rootPathForFixture(fixture.relativePath),
        packageJson: {}
    };
    assert.strictEqual(getModuleKind(moduleObject), fixture.expectedKind,
        'Generated context kind must be project-neutral for ' + fixture.relativePath);
    assert.strictEqual(inferKind(moduleObject), fixture.expectedKind,
        'Metadata normalization kind must be project-neutral for ' + fixture.relativePath);
});

const nPrefixedCapability = {
    name: 'nInventory',
    relativePath: 'gFramework/nInventory',
    path: rootPathForFixture('gFramework/nInventory'),
    packageJson: {
        name: 'nInventory',
        nodics: {
            kind: 'capability'
        }
    }
};
assert.strictEqual(getModuleKind(nPrefixedCapability), 'capability',
    'Generated context kind must not infer group behavior from an n-prefixed name');
assert.strictEqual(inferKind(nPrefixedCapability), 'capability',
    'Metadata normalization kind must not infer group behavior from an n-prefixed name');

const runtimeBootstrapSource = fs.readFileSync(path.join(__dirname, '../../nConfig/bin/nodics.js'), 'utf8');
assert(!runtimeBootstrapSource.includes("options.defaultServer || 'startioLocalServer'"),
    'Framework bootstrap must not hardcode a project server');

const nToolingSrcPath = path.join(process.cwd(), 'gFramework', 'nTooling', 'src');
fs.readdirSync(nToolingSrcPath, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .forEach(entry => {
        assert.strictEqual(entry.name, 'service',
            'nTooling source must stay service-owned; unexpected src folder: gFramework/nTooling/src/' + entry.name);
    });
collectJavaScriptFiles(nToolingSrcPath).forEach(filePath => {
    assert(path.basename(filePath).endsWith('Service.js'),
        'nTooling source files must use service filenames so tooling behavior follows Nodics service conventions: ' +
        path.relative(process.cwd(), filePath));
});

function rootPathForFixture(relativePath) {
    return path.join(process.cwd(), relativePath);
}

/**
 * Validates that loader-managed source files are discoverable by Nodics runtime loaders.
 *
 * @param {Object} moduleObject Module context from generated module scanning.
 * @returns {void}
 */
function validateLoaderManagedSource(moduleObject) {
    Object.keys(loaderManagedSource).forEach(relativeDirectory => {
        const directory = path.join(moduleObject.path, relativeDirectory);
        if (!fs.existsSync(directory)) {
            return;
        }
        collectJavaScriptFiles(directory).forEach(filePath => {
            const relativeFilePath = path.relative(moduleObject.path, filePath).split(path.sep).join('/');
            const fileName = path.basename(filePath);
            if (relativeFilePath.includes('/gen/') || relativeFilePath.includes('/generated/')) {
                return;
            }
            if (fileName === 'common.js') {
                assert(isGenerationTemplate(filePath),
                    'Loader-managed common.js must be documented as a generator template, not runtime-loaded source: ' +
                    moduleObject.relativePath + '/' + relativeFilePath);
                return;
            }
            const contract = loaderManagedSource[relativeDirectory];
            assert(fileName.endsWith(contract.suffix),
                contract.loader + ' loader will not discover `' + moduleObject.relativePath + '/' +
                relativeFilePath + '`. Move it to a non-loader directory or rename it with `' +
                contract.suffix + '`.');
        });
    });
}

/**
 * Validates standard source contribution folders and their registry files.
 *
 * @param {Object} moduleObject Module context from generated module scanning.
 * @returns {void}
 */
function validateStandardSourceStructure(moduleObject) {
    const sourcePath = path.join(moduleObject.path, 'src');
    if (!fs.existsSync(sourcePath)) {
        return;
    }
    fs.readdirSync(sourcePath, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .forEach(entry => {
            assert(standardSourceDirectories.has(entry.name),
                'Non-standard source directory `' + moduleObject.relativePath + '/src/' + entry.name +
                '`. Add it to the module standard or move it under an existing standard source folder.');
        });
    Object.keys(sourceDefinitionFiles).forEach(relativeDirectory => {
        const directory = path.join(moduleObject.path, relativeDirectory);
        if (!fs.existsSync(directory)) {
            return;
        }
        sourceDefinitionFiles[relativeDirectory].forEach(fileName => {
            const definitionPath = path.join(directory, fileName);
            assert(fs.existsSync(definitionPath),
                'Standard source definition folder must include registry file: ' +
                moduleObject.relativePath + '/' + relativeDirectory + '/' + fileName);
        });
    });
    const servicePath = path.join(moduleObject.path, 'src/service');
    if (fs.existsSync(servicePath)) {
        const sampleServicePath = path.join(servicePath, 'defaultSampleService.js');
        assert(fs.existsSync(sampleServicePath),
            'Standard service folder must include default sample service scaffold: ' +
            moduleObject.relativePath + '/src/service/defaultSampleService.js');
    }
}

/**
 * Recursively collects JavaScript files below a directory.
 *
 * @param {string} directory Directory to scan.
 * @param {string[]} files Mutable file collection.
 * @returns {string[]} JavaScript files.
 */
function collectJavaScriptFiles(directory, files = []) {
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

/**
 * Checks whether a loader-directory suffix exception is an explicit generator template.
 *
 * @param {string} filePath JavaScript file path.
 * @returns {boolean} Whether the file is a documented generator template.
 */
function isGenerationTemplate(filePath) {
    const source = fs.readFileSync(filePath, 'utf8');
    return generationTemplateNames.has(path.basename(filePath)) &&
        /@layer\s+template/.test(source) &&
        /@sourceTemplate/.test(source);
}

console.log('Nodics module structure validated: ' + modules.length + ' modules');
