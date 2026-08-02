/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * @module import/test/initDataActivationEnvironmentGovernance
 * @description Verifies init/core/sample data-release activation, protected
 * environment gating, and mandatory bootstrap identity provisioning across
 * the import, auth, profile, and Startio configuration boundary.
 * @layer test
 * @owner import
 * @override Projects may enable additional environment-owned data releases
 * and secret sources through later configuration, but must preserve explicit
 * activation, manifest integrity, and governed bootstrap identity validation.
 */

const repositoryRoot = path.resolve(__dirname, '../../../../../');
const importProperties = require('../config/properties');
const authDefaults = require('../../../../nAuth/config/properties').authSecurity;
const localProperties = require(path.join(repositoryRoot, 'startio/envs/startioLocal/config/properties'));
const protectedEnvironmentPropertyPaths = [
    'startio/envs/config/properties.js',
    'startio/envs/startioDev/config/properties.js',
    'startio/envs/startioQA/config/properties.js',
    'startio/envs/startioPreProd/config/properties.js',
    'startio/envs/startioProd/config/properties.js'
];
const protectedEnvironmentRoots = [
    'startio/envs',
    'startio/envs/startioDev',
    'startio/envs/startioQA',
    'startio/envs/startioPreProd',
    'startio/envs/startioProd'
];
const profileEmployeeDataPath = path.join(repositoryRoot, 'gCore/profile/data/init/data/user/defaultEmployeeData.js');

function loadProperties(relativePath) {
    return require(path.join(repositoryRoot, relativePath));
}

function config(values) {
    const effective = _.merge({ authSecurity: _.merge({}, authDefaults) }, values || {});
    return {
        get: function (key) {
            return effective[key];
        }
    };
}

function loadProfileBootstrapEmployees(activeConfig) {
    delete require.cache[profileEmployeeDataPath];
    global.CONFIG = activeConfig;
    try {
        return require(profileEmployeeDataPath);
    } finally {
        delete require.cache[profileEmployeeDataPath];
        delete global.CONFIG;
    }
}

const defaultReleasePolicy = importProperties.data.dataReleases;

assert.deepStrictEqual(defaultReleasePolicy.allowedContractVersions, [1]);
assert.strictEqual(defaultReleasePolicy.types.init.enabled, true);
assert.strictEqual(defaultReleasePolicy.types.init.operatorExecution, true);
assert.strictEqual(defaultReleasePolicy.types.core.enabled, true);
assert.strictEqual(defaultReleasePolicy.types.core.operatorExecution, true);
assert.strictEqual(defaultReleasePolicy.types.sample.enabled, false);
assert.strictEqual(defaultReleasePolicy.types.sample.operatorExecution, false);

assert.strictEqual(localProperties.data.dataReleases.types.sample.enabled, true);
assert.strictEqual(localProperties.data.dataReleases.types.sample.operatorExecution, true);
assert.strictEqual(localProperties.data.contentPacks.enabled, true);
assert.strictEqual(
    fs.existsSync(path.join(repositoryRoot, 'startio/envs/startioLocal/data/init/manifest.json')),
    true,
    'startioLocal may own local developer init data explicitly'
);

protectedEnvironmentPropertyPaths.forEach(relativePath => {
    const properties = loadProperties(relativePath);
    const label = relativePath;
    assert.notStrictEqual(_.get(properties, 'data.dataReleases.types.sample.enabled'), true,
        label + ' must not enable sample data releases by default');
    assert.notStrictEqual(_.get(properties, 'data.dataReleases.types.sample.operatorExecution'), true,
        label + ' must not enable operator sample execution by default');
    assert.notStrictEqual(_.get(properties, 'data.contentPacks.enabled'), true,
        label + ' must not enable content-pack imports by default');
});

protectedEnvironmentRoots.forEach(relativeRoot => {
    assert.strictEqual(
        fs.existsSync(path.join(repositoryRoot, relativeRoot, 'data/init/manifest.json')),
        false,
        relativeRoot + ' must not carry environment-owned init data unless explicitly governed'
    );
});

assert.throws(() => loadProfileBootstrapEmployees(config({})), /Bootstrap identity source/,
    'Mandatory profile bootstrap employees must not materialize without governed bootstrap identity');

assert.throws(() => loadProfileBootstrapEmployees(config({
    bootstrapIdentity: localProperties.bootstrapIdentity
})), /Local bootstrap identity sources are disabled/,
'Local bootstrap identity must not be usable with protected auth defaults');

const employees = loadProfileBootstrapEmployees(config({
    authSecurity: {
        compatibility: {
            allowLocalBootstrapIdentity: true
        }
    },
    bootstrapIdentity: {
        source: 'test',
        adminPassword: 'test-admin-password-12345',
        servicePassword: 'test-service-password-12345',
        serviceApiKey: 'test-service-api-key-value-12345678901234567890'
    }
}));
assert.strictEqual(employees.record0.code, 'admin');
assert.strictEqual(employees.record0.password.password, 'test-admin-password-12345');
assert.strictEqual(employees.record1.code, 'apiAdmin');
assert.strictEqual(employees.record1.apiKey, 'test-service-api-key-value-12345678901234567890');

console.log('Init-data activation and environment governance validated');
