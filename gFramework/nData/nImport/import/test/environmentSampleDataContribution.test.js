/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * @module import/test/environmentSampleDataContribution
 * @description Verifies that an arbitrarily named active environment module contributes layered sample headers and data through the same module-owned import discovery contract as capability modules.
 * @layer test
 * @owner import
 * @override Projects may add environment-specific sample fixtures without naming conventions or framework changes.
 */

/**
 * Recursively collects fixture files that match the supplied predicate.
 *
 * @param {string} root root directory to inspect
 * @param {Function} matcher filename predicate
 * @param {object} result mutable file map used by the import utility fixture
 * @returns {void}
 */
function walk(root, matcher, result) {
    if (!fs.existsSync(root)) return;
    fs.readdirSync(root).forEach(name => {
        const filePath = path.join(root, name);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath, matcher, result);
        } else if (matcher(name)) {
            result[path.basename(name, path.extname(name)) + '_' + path.extname(name).slice(1)] = filePath;
        }
    });
}

global.UTILS = {
    /** @returns {boolean} whether the supplied fixture value is blank */
    isBlank: function (value) { return value === undefined || value === null || value === ''; },
    /** @returns {void} collects import header fixtures below the supplied root */
    getHeaderFiles: function (root, result) {
        walk(root, name => /Headers?\.[^.]+$/.test(name), result);
    },
    /** @returns {void} collects import data fixtures below the supplied root */
    getDataFiles: function (root, result) {
        walk(root, name => !/Headers?\.[^.]+$/.test(name), result);
    }
};
global.CLASSES = {
    DataImportError: function DataImportError(error, message) {
        this.error = error;
        this.message = message;
    }
};

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-environment-sample-'));
const capabilityPath = path.join(root, 'FeatureModule');
const environmentPath = path.join(root, 'BlueBoundary');
const capabilitySample = path.join(capabilityPath, 'data', 'sample');
const environmentSample = path.join(environmentPath, 'data', 'sample');

[capabilitySample, environmentSample].forEach(samplePath => {
    fs.mkdirSync(path.join(samplePath, 'headers'), { recursive: true });
    fs.mkdirSync(path.join(samplePath, 'data'), { recursive: true });
});
fs.writeFileSync(path.join(capabilitySample, 'headers', 'featureHeader.js'), 'module.exports = {};');
fs.writeFileSync(path.join(capabilitySample, 'data', 'featureData.js'), 'module.exports = {};');
fs.writeFileSync(path.join(environmentSample, 'headers', 'boundaryHeader.js'), 'module.exports = {};');
fs.writeFileSync(path.join(environmentSample, 'data', 'boundaryData.js'), 'module.exports = {};');

global.NODICS = {
    /** @returns {Map<string, object>} active capability and environment fixture modules */
    getIndexedModules: function () {
        return new Map([
            ['10', { name: 'FeatureModule', path: capabilityPath, metaData: { nodics: { kind: 'capability' } } }],
            ['20', { name: 'BlueBoundary', path: environmentPath, metaData: { nodics: { kind: 'environment' } } }]
        ]);
    }
};

const utility = require('../src/service/import/defaultImportUtilityService');

(async function () {
    const selectedModules = ['FeatureModule', 'BlueBoundary'];
    const headers = await utility.getSystemDataHeaders(selectedModules, 'sample');
    const dataFiles = await utility.getSystemDataFiles(selectedModules, 'sample');

    assert(headers.featureHeader_js.some(file => file.indexOf(capabilityPath) === 0));
    assert(headers.boundaryHeader_js.some(file => file.indexOf(environmentPath) === 0));
    assert(dataFiles.featureData_js.some(file => file.indexOf(capabilityPath) === 0));
    assert(dataFiles.boundaryData_js.some(file => file.indexOf(environmentPath) === 0));

    const capabilityOnly = await utility.getSystemDataFiles(['FeatureModule'], 'sample');
    assert(capabilityOnly.featureData_js);
    assert.strictEqual(capabilityOnly.boundaryData_js, undefined);

    console.log('Environment module sample-data contribution validated');
})().finally(() => fs.rmSync(root, { recursive: true, force: true })).catch(error => {
    console.error(error);
    process.exit(1);
});
