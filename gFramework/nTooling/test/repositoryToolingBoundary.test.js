/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/repositoryToolingBoundary
 * @description Prevents executable tooling from returning to the root scripts folder or depending on temporary docs configuration.
 * @layer test
 * @owner nTooling
 * @override Repository layout changes must preserve module ownership and the disposable docs boundary.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const documentationCoverage = require('../src/service/quality/defaultDocumentationCoverageQualityService');

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
const toolingProperties = require('../config/properties');
assert(toolingProperties.tooling.documentationGovernance.enforcedGates.length > 0,
    'Documentation governance must be owned by nTooling properties');

const coverageFixture = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-doc-boundary-'));
try {
    fs.mkdirSync(path.join(coverageFixture, 'docs'), { recursive: true });
    fs.mkdirSync(path.join(coverageFixture, 'sample', 'src', 'service'), { recursive: true });
    fs.writeFileSync(
        path.join(coverageFixture, 'docs', 'copiedReference.js'),
        'module.exports = { undocumented: function () {} };\n',
        'utf8'
    );
    fs.writeFileSync(
        path.join(coverageFixture, 'sample', 'src', 'service', 'sampleService.js'),
        '/** commentedExample: { test: function () {} } */\nmodule.exports = {\n    undocumented: function () {}\n};\n',
        'utf8'
    );
    const report = documentationCoverage.collectCoverage(documentationCoverage.createOptions([
        '--home=' + coverageFixture,
        '--scope=all'
    ]));
    assert.deepStrictEqual(report.filesMissingModuleDocs, [
        path.join('sample', 'src', 'service', 'sampleService.js')
    ], 'Root docs reference files must not be included in source documentation coverage');
    assert.deepStrictEqual(report.methodsMissingDocs, [
        path.join('sample', 'src', 'service', 'sampleService.js') + '#undocumented'
    ], 'Documentation coverage must ignore function examples inside comments');
} finally {
    fs.rmSync(coverageFixture, { recursive: true, force: true });
}

const toolingPackage = JSON.parse(fs.readFileSync(
    path.join(rootPath, 'gFramework', 'nTooling', 'package.json'),
    'utf8'
));
assert.strictEqual(toolingPackage.nodics.runtimeModule, false);
assert.strictEqual(toolingPackage.nodics.loadableByNodicsModuleLoader, false);

console.log('Repository tooling and docs boundary validated');
