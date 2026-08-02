/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/DependencyRuntimeContract
 * @description Verifies the repository declares supported Node.js/npm versions,
 * package-lock ownership, and release dependency validation commands.
 * @layer test
 * @owner nTooling
 * @override Project repositories may extend the matrix, but must keep a
 * source-controlled runtime and lockfile policy before release.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../..');
const packageJson = require(path.join(repositoryRoot, 'package.json'));
const lockfilePath = path.join(repositoryRoot, 'package-lock.json');
const nvmrcPath = path.join(repositoryRoot, '.nvmrc');
const governance = packageJson.nodics && packageJson.nodics.dependencyGovernance;
const runtimeDependencies = packageJson.dependencies || {};
const devDependencies = packageJson.devDependencies || {};
const optionalDependencies = packageJson.optionalDependencies || {};

assert(packageJson.engines, 'Root package.json must declare Node.js and npm engines');
assert.strictEqual(packageJson.engines.node, '>=22 <27', 'Node engine range must cover the supported/forward validation matrix');
assert.strictEqual(packageJson.engines.npm, '>=10 <12', 'npm engine range must be explicit');
assert.strictEqual(packageJson.packageManager, 'npm@11.6.2', 'packageManager must pin the npm client used for lockfile updates');
assert(devDependencies.chai && devDependencies.mocha,
    'Test-only assertion and runner libraries must be devDependencies');
assert(!runtimeDependencies.chai && !runtimeDependencies.mocha,
    'Test-only dependencies must not be mandatory runtime dependencies');
[
    '@elastic/elasticsearch',
    'hazelcast-client',
    'kafkajs',
    'node-cache',
    'redis',
    'stompit',
    'winston-elasticsearch'
].forEach(packageName => {
    assert(optionalDependencies[packageName], 'Provider adapter must be optional at the root package level: ' + packageName);
    assert(!runtimeDependencies[packageName], 'Provider adapter must not be mandatory runtime dependency: ' + packageName);
});

assert(governance, 'Root package.json must declare nodics.dependencyGovernance');
assert.strictEqual(governance.preferredNodeMajor, 24, 'Node 24 must be the preferred release line');
assert.deepStrictEqual(governance.supportedNodeMajors, [22, 24], 'Supported Node lines must be explicit');
assert.deepStrictEqual(governance.forwardValidationNodeMajors, [26], 'Forward validation Node lines must be explicit');
assert(governance.unsupportedNodeMajors.includes(25), 'Node 25 must not be release-supported');
assert.strictEqual(governance.minimumNpmMajor, 10);
assert.strictEqual(governance.maximumNpmMajorExclusive, 12);

assert(fs.existsSync(lockfilePath), 'package-lock.json is required');
assert(fs.existsSync(nvmrcPath), '.nvmrc is required');
assert.strictEqual(fs.readFileSync(nvmrcPath, 'utf8').trim().split('.')[0], '24', '.nvmrc must point to the preferred Node major');

const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
assert(lockfile.lockfileVersion >= 2, 'package-lock.json must use npm lockfile version 2 or newer');
assert.strictEqual(governance.lockfile.required, true, 'Lockfile must be required');
assert.strictEqual(governance.lockfile.file, 'package-lock.json', 'Lockfile path must be declared');
assert.strictEqual(governance.lockfile.installCommand, 'npm ci', 'Release installs must use npm ci');
assert.strictEqual(governance.lockfile.commitWithPackageJson, true, 'Dependency changes must commit package and lockfile together');
assert.strictEqual(packageJson.allowScripts && packageJson.allowScripts['@scarf/scarf'], false,
    'Swagger UI transitive Scarf install script must remain denied until reviewed as a Nodics-owned runtime need');

[
    'npm ci',
    'npm audit --omit=dev',
    'npm run clean',
    'npm run build',
    'npm run llm:validate',
    'npm run quality:docs',
    'npm run test:basic',
    'npm run test:full'
].forEach(command => {
    assert(governance.releaseValidation.includes(command), 'Missing dependency release validation command: ' + command);
});

assert(!fs.existsSync(path.join(repositoryRoot, 'npm-shrinkwrap.json')), 'Use package-lock.json, not npm-shrinkwrap.json');

console.log('Dependency runtime contract validated');
