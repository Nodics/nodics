/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * @module import/test/dataReleaseService
 * @description Validates discovery, preflight, installation projection, immutable version selection, disabled types, and fail-safe checksum projection.
 * @layer test
 * @owner import
 */
let root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-data-release-'));
let releaseRoot = path.join(root, 'data', 'core');
fs.mkdirSync(path.join(releaseRoot, 'headers'), { recursive: true });
fs.mkdirSync(path.join(releaseRoot, 'data'), { recursive: true });
fs.writeFileSync(path.join(releaseRoot, 'headers', 'header.js'), 'module.exports = {};\n');
fs.writeFileSync(path.join(releaseRoot, 'data', 'data.js'), 'module.exports = [];\n');
let files = {};
['data/data.js', 'headers/header.js'].forEach(file => {
    files[file] = crypto.createHash('sha256').update(fs.readFileSync(path.join(releaseRoot, file))).digest('hex');
});
fs.writeFileSync(path.join(releaseRoot, 'manifest.json'), JSON.stringify({
    contractVersion: 1, module: 'testModule', dataType: 'core', version: '1.1.0',
    description: 'Test core release', files: files
}));

global.CONFIG = { get: key => key === 'data' ? {
    dataReleases: {
        allowedContractVersions: [1], maximumFilesPerRelease: 10, maximumModulesPerRun: 5,
        allowDowngrade: false, types: { core: { enabled: true, operatorExecution: true }, sample: { enabled: false } }
    }
} : key === 'defaultTenant' ? 'default' : undefined };
global.NODICS = {
    getActiveModules: () => ['testModule'],
    getRawModule: () => ({
        name: 'testModule', path: root, parent: 'testGroup', canonicalIdentity: 'testGroup/testModule',
        metaData: { nodics: { displayName: 'Test Module' } }
    }),
    getSelectedEnvironmentName: () => 'testEnvironment'
};
let installations = [];
let importAttempts = 0;
global.SERVICE = {
    DefaultDataInstallationService: {
        get: request => Promise.resolve({ result: installations.filter(item => !request.query.code || item.code === request.query.code) }),
        save: request => { installations.push(request.model); return Promise.resolve(request.model); },
        update: request => {
            let index = installations.findIndex(item => item.code === request.query.code);
            installations[index] = request.model;
            return Promise.resolve(request.model);
        }
    },
    DefaultImportService: {
        importCoreData: request => {
            importAttempts++;
            request.importRun = { runId: request.options.validateOnly ? 'validate-run' : 'install-run' };
            return Promise.resolve({ validationOnly: request.options.validateOnly });
        }
    }
};

const service = require('../src/service/release/defaultDataReleaseService');

(async function () {
    let catalogue = await service.getCatalogue({ tenant: 'default', dataType: 'core' });
    assert.strictEqual(catalogue.data.length, 1);
    assert.strictEqual(catalogue.data[0].displayName, 'Test Module');
    assert.strictEqual(catalogue.data[0].status, 'NOT_INSTALLED');

    let preflight = await service.preflight({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    });
    assert.strictEqual(preflight.data.validation.validationOnly, true);
    assert.strictEqual(preflight.data.validation.importExecuted, false);
    assert.strictEqual(preflight.data.validation.skipped, false);
    assert.strictEqual(preflight.data.releases[0].status, 'NOT_INSTALLED');
    assert.strictEqual(installations.length, 0);
    assert.strictEqual(importAttempts, 0);

    let execution = await service.execute({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    });
    assert.strictEqual(execution.data.importRun.runId, 'install-run');
    assert.strictEqual(execution.data.releases[0].status, 'CURRENT');
    assert.strictEqual(execution.data.releases[0].installedVersion, '1.1.0');
    assert.strictEqual(installations.length, 1);

    catalogue = await service.getCatalogue({ tenant: 'default', dataType: 'core' });
    assert.strictEqual(catalogue.data[0].status, 'CURRENT');
    assert.strictEqual(catalogue.data[0].installedVersion, '1.1.0');

    preflight = await service.preflight({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    });
    assert.strictEqual(preflight.data.releases[0].status, 'CURRENT');
    assert.strictEqual(preflight.data.validation.skipped, true);
    assert.strictEqual(preflight.data.validation.importExecuted, false);
    assert.strictEqual(importAttempts, 1);

    await assert.rejects(() => service.execute({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    }), /already current/);

    await assert.rejects(() => service.preflight({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.0.0' } }
    }), /changed after selection/);
    await assert.rejects(() => service.preflight({
        tenant: 'default', releaseRequest: { dataType: 'sample', modules: ['testModule'] }
    }), /disabled/);

    fs.writeFileSync(path.join(releaseRoot, 'data', 'data.js'), 'module.exports = [1];\n');
    let invalidReleases = service.discoverReleases('core');
    assert.strictEqual(invalidReleases.length, 1);
    assert.strictEqual(invalidReleases[0].invalidManifest, true);
    catalogue = await service.getCatalogue({ tenant: 'default', dataType: 'core' });
    assert.strictEqual(catalogue.data[0].status, 'INVALID_RELEASE');
    assert.match(catalogue.data[0].invalidReason, /checksum validation failed/);
    await assert.rejects(() => service.preflight({
        tenant: 'default',
        releaseRequest: { dataType: 'core', modules: ['testModule'], expectedReleases: { testModule: '1.1.0' } }
    }), /manifest is invalid/);
    fs.rmSync(root, { recursive: true, force: true });
    console.log('Data release service contracts validated');
})().catch(error => {
    fs.rmSync(root, { recursive: true, force: true });
    console.error(error);
    process.exit(1);
});
