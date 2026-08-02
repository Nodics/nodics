/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

/**
 * @module gFramework/nAuth/test/bootstrapCredentialEnvironmentGovernance
 * @description Proves local bootstrap credentials, local API keys, sample
 * passwords, and local JWT/API-key secrets are accepted only by the explicit
 * local compatibility environment and cannot satisfy protected environment
 * authentication-security validation.
 * @layer test
 * @owner nAuth
 * @override Projects may add stricter environment secret gates, but must not
 * enable predictable bootstrap credentials outside explicit local/test layers.
 */

const repositoryRoot = path.resolve(__dirname, '../../..');
const authSecurity = require('../src/service/security/defaultAuthSecurityService');
const authDefaults = require('../config/properties').authSecurity;

function loadProperties(relativePath) {
    return require(path.join(repositoryRoot, relativePath));
}

function configuration(values) {
    const effective = _.merge({ authSecurity: _.merge({}, authDefaults) }, values || {});
    return {
        get: function (key) {
            return effective[key];
        }
    };
}

function read(relativePath) {
    return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

const localPropertiesPath = 'startio/envs/startioLocal/config/properties.js';
const localProperties = loadProperties(localPropertiesPath);
const protectedEnvironmentPropertyPaths = [
    'startio/envs/config/properties.js',
    'startio/envs/startioDev/config/properties.js',
    'startio/envs/startioQA/config/properties.js',
    'startio/envs/startioPreProd/config/properties.js',
    'startio/envs/startioProd/config/properties.js'
];

const protectedRuntimeNames = ['startioDev', 'startioQA', 'startioPreProd', 'startioProd'];
const localIdentity = localProperties.bootstrapIdentity;

assert.strictEqual(authDefaults.compatibility.allowLocalBootstrapIdentity, false);
assert.strictEqual(authDefaults.compatibility.allowInsecureDevelopmentSecret, false);
assert.strictEqual(authDefaults.jwt.secret, null);
assert.strictEqual(authDefaults.apiKey.pepper, null);

assert.strictEqual(
    authSecurity.validateBootstrapIdentity(configuration(localProperties)).source,
    'localSample',
    'Only the explicit local environment may opt into local sample bootstrap identity'
);

assert.throws(() => authSecurity.validateBootstrapIdentity(configuration({
    bootstrapIdentity: localIdentity
})), /Local bootstrap identity sources are disabled/,
'Local sample bootstrap identity must fail with framework protected defaults');

assert.strictEqual(
    typeof authSecurity.getJwtSecret(configuration(localProperties)),
    'string',
    'The local environment must still provide a usable JWT secret for developer authentication'
);

protectedEnvironmentPropertyPaths.forEach(relativePath => {
    const properties = loadProperties(relativePath);
    const source = read(relativePath);
    const label = relativePath;
    assert.strictEqual(properties.defaultAuthDetail, undefined, label + ' must not define default API credentials');
    assert.strictEqual(properties.bootstrapIdentity, undefined, label + ' must not define bootstrap passwords or API keys');
    assert.notStrictEqual(_.get(properties, 'authSecurity.compatibility.allowLocalBootstrapIdentity'), true,
        label + ' must not enable local bootstrap identity compatibility');
    assert.notStrictEqual(_.get(properties, 'authSecurity.compatibility.allowInsecureDevelopmentSecret'), true,
        label + ' must not enable insecure JWT compatibility');
    assert.strictEqual(_.get(properties, 'authSecurity.jwt.secret'), undefined,
        label + ' must not carry local JWT secret material');
    assert.strictEqual(_.get(properties, 'authSecurity.apiKey.pepper'), undefined,
        label + ' must not carry local API-key pepper material');
    assert.strictEqual(source.includes('adminPassword'), false, label + ' must not contain predictable admin password text');
    assert.strictEqual(source.includes('servicePassword'), false, label + ' must not contain predictable service password text');
    assert.strictEqual(source.includes('944515ac-bbac-51cd-ac7e-3bbbb3c81bff'), false,
        label + ' must not contain the local sample API key');
});

protectedRuntimeNames.forEach(environmentName => {
    assert.strictEqual(
        localPropertiesPath.includes(environmentName),
        false,
        environmentName + ' must not reuse the local compatibility credential file'
    );
});

console.log('Bootstrap credential environment governance validated');
