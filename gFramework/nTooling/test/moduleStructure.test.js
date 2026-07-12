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

const { scanModules, getModuleKind } = require('../src/context/moduleLlmContextUtils');
const { inferKind } = require('../src/context/normalizeModuleMetadata');

const requiredConfigFiles = [
    'config/properties.js',
    'config/prescripts.js',
    'config/postscripts.js'
];
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
});

const customHierarchyFixtures = [
    { relativePath: 'acme/acmeEnvs', expectedKind: 'group' },
    { relativePath: 'acme/acmeEnvs/development', expectedKind: 'environment' },
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

const runtimeBootstrapSource = fs.readFileSync(path.join(__dirname, '../../nConfig/bin/nodics.js'), 'utf8');
assert(!runtimeBootstrapSource.includes("options.defaultServer || 'kickoffLocalServer'"),
    'Framework bootstrap must not hardcode the kickoff project server');

function rootPathForFixture(relativePath) {
    return path.join(process.cwd(), relativePath);
}

console.log('Nodics module structure validated: ' + modules.length + ' modules');
