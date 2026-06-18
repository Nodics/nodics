/**
 * @module nTooling/test/repositoryToolingBoundary
 * @description Prevents executable tooling from returning to the root scripts folder or depending on temporary docs configuration.
 * @layer test
 * @owner nTooling
 * @override Repository layout changes must preserve module ownership and the disposable docs boundary.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const rootPath = path.resolve(__dirname, '../../..');
const scriptsPath = path.join(rootPath, 'scripts');
const packageJson = JSON.parse(fs.readFileSync(path.join(rootPath, 'package.json'), 'utf8'));

const rootScriptFiles = fs.existsSync(scriptsPath) ?
    fs.readdirSync(scriptsPath, { withFileTypes: true }).filter(entry => entry.isFile()) : [];
assert.strictEqual(rootScriptFiles.length, 0,
    'Root scripts must be owned by nTooling, nTest, or their domain module');

Object.keys(packageJson.scripts || {}).forEach(scriptName => {
    const command = packageJson.scripts[scriptName];
    assert(!/node\s+scripts\//.test(command),
        'Package command `' + scriptName + '` must not execute a root scripts implementation');
    assert(!/docs\/[^\s]+\.(json|js)/.test(command),
        'Package command `' + scriptName + '` must not load executable configuration from docs');
});

assert(!fs.existsSync(path.join(rootPath, 'docs', 'documentation-governance.json')),
    'Documentation governance must not live in disposable docs');
assert(fs.existsSync(path.join(rootPath, 'gFramework', 'nTooling', 'config', 'documentation-governance.json')),
    'Documentation governance must be owned by nTooling');

const toolingPackage = JSON.parse(fs.readFileSync(
    path.join(rootPath, 'gFramework', 'nTooling', 'package.json'),
    'utf8'
));
assert.strictEqual(toolingPackage.nodics.runtimeModule, false);
assert.strictEqual(toolingPackage.nodics.loadableByNodicsModuleLoader, false);

console.log('Repository tooling and docs boundary validated');
