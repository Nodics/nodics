/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/contentPackService
 * @description Verifies disabled defaults, manifest and checksum validation,
 * source-safe staging, tenant-scoped import state, update detection, immutable
 * same-version releases, and downgrade rejection.
 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const serviceDefinition = require('../src/service/contentPack/defaultContentPackService');

function digest(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function createFixture() {
    let workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-content-pack-'));
    let nodicsHome = path.join(workspace, 'nodics');
    let repository = path.join(workspace, 'nodicsdocs');
    let serverPath = path.join(nodicsHome, 'server');
    let generatedFile = path.join(repository, 'data/core/headers/contentHeader.js');
    fs.mkdirSync(path.dirname(generatedFile), { recursive: true });
    fs.mkdirSync(path.join(repository, 'data/core/data'), { recursive: true });
    fs.mkdirSync(path.join(repository, 'manifest'), { recursive: true });
    fs.writeFileSync(generatedFile, 'module.exports = {};\n');
    let relativeFile = 'data/core/headers/contentHeader.js';
    let manifest = {
        pack: 'nodicsdocs',
        version: '1.0.0',
        contractVersion: 1,
        generatedHashes: {
            [relativeFile]: digest(fs.readFileSync(generatedFile))
        }
    };
    fs.writeFileSync(
        path.join(repository, 'manifest/generated-content-pack.json'),
        JSON.stringify(manifest)
    );
    return {
        workspace,
        nodicsHome,
        repository,
        serverPath,
        generatedFile,
        manifest
    };
}

function createHarness(fixture, enabled) {
    let records = [];
    let config = {
        defaultTenant: 'default',
        data: {
            dataDirName: 'temp',
            contentPacks: {
                enabled: enabled,
                allowedContractVersions: [1],
                cleanupStaging: true,
                stagingDirectory: 'import/content-packs',
                packs: {
                    nodicsDocumentation: {
                        enabled: true,
                        manifestPack: 'nodicsdocs',
                        source: {
                            type: 'LOCAL_SIBLING',
                            repositoryName: 'nodicsdocs',
                            contentPath: 'data/core',
                            manifestPath: 'manifest/generated-content-pack.json'
                        },
                        updatePolicy: {
                            allowDowngrade: false,
                            sameVersionContentChange: 'REJECT'
                        },
                        presentation: {
                            title: 'Nodics documentation',
                            unavailableMessage: 'Unavailable',
                            disabledMessage: 'Disabled',
                            importAction: 'Import',
                            updateAction: 'Update',
                            retryAction: 'Retry'
                        }
                    }
                }
            }
        }
    };
    global.CONFIG = {
        get: property => config[property]
    };
    global.NODICS = {
        getNodicsHome: () => fixture.nodicsHome,
        getServerPath: () => fixture.serverPath
    };
    global.CLASSES = {
        DataImportError: class DataImportError extends Error {
            constructor(code, message) {
                super(message);
                this.code = code;
            }
        }
    };
    global.SERVICE = {
        DefaultImportRunHistoryService: {
            getImportRunService: () => ({
                get: request => {
                    let matches = records.filter(record =>
                        record.tenant === request.tenant &&
                        record.contentPackCode === request.query.contentPackCode &&
                        record.status === request.query.status
                    );
                    return Promise.resolve({ result: matches });
                }
            })
        },
        DefaultImportService: {
            importLocalData: request => {
                assert.notStrictEqual(request.inputPath.rootPath, path.join(fixture.repository, 'data/core'));
                assert(fs.existsSync(path.join(request.inputPath.rootPath, 'headers/contentHeader.js')));
                records.push(Object.assign({ tenant: request.tenant }, request.importRun, {
                    status: 'COMPLETED'
                }));
                return Promise.resolve({ imported: true });
            }
        }
    };
    return {
        service: Object.assign({}, serviceDefinition, {
            activeImports: new Map(),
            recentCompletions: new Map()
        }),
        config,
        records
    };
}

(async () => {
    let fixture = createFixture();
    try {
        let disabled = createHarness(fixture, false);
        let disabledStatus = await disabled.service.getStatus({ packCode: 'nodicsDocumentation' });
        assert.strictEqual(disabledStatus.data.state, 'DISABLED');
        assert.deepStrictEqual(disabledStatus.data.allowedOperations, []);

        let harness = createHarness(fixture, true);
        await assert.rejects(
            harness.service.getStatus({ packCode: 'unknownPack' }),
            error => error.code === 'ERR_IMP_00004'
        );
        let initial = await harness.service.getStatus({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(initial.data.state, 'NOT_INSTALLED');
        assert.deepStrictEqual(initial.data.allowedOperations, ['IMPORT']);

        let imported = await harness.service.importPack({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(imported.data.state, 'CURRENT');
        assert.strictEqual(imported.data.installedVersion, '1.0.0');
        assert.strictEqual(fs.readFileSync(fixture.generatedFile, 'utf8'), 'module.exports = {};\n');

        let current = await harness.service.getStatus({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(current.data.state, 'CURRENT');
        assert.deepStrictEqual(current.data.allowedOperations, []);

        harness.records.unshift({
            tenant: 'tenant-a',
            contentPackCode: 'nodicsDocumentation',
            contentPackVersion: '0.8.0',
            contentPackChecksum: 'older-release',
            status: 'COMPLETED',
            finishedAt: '2025-01-01T00:00:00.000Z'
        });
        current = await harness.service.getStatus({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(current.data.state, 'CURRENT');
        assert.strictEqual(current.data.installedVersion, '1.0.0');

        fs.writeFileSync(fixture.generatedFile, 'module.exports = { changed: true };\n');
        fixture.manifest.generatedHashes['data/core/headers/contentHeader.js'] =
            digest(fs.readFileSync(fixture.generatedFile));
        fs.writeFileSync(
            path.join(fixture.repository, 'manifest/generated-content-pack.json'),
            JSON.stringify(fixture.manifest)
        );
        await assert.rejects(
            harness.service.importPack({
                packCode: 'nodicsDocumentation',
                tenant: 'tenant-a'
            }),
            error => error.code === 'ERR_IMP_00003' && /without a version change/.test(error.message)
        );

        fixture.manifest.version = '1.1.0';
        fs.writeFileSync(
            path.join(fixture.repository, 'manifest/generated-content-pack.json'),
            JSON.stringify(fixture.manifest)
        );
        let update = await harness.service.getStatus({
            packCode: 'nodicsDocumentation',
            tenant: 'tenant-a'
        });
        assert.strictEqual(update.data.state, 'UPDATE_AVAILABLE');
        assert.deepStrictEqual(update.data.allowedOperations, ['UPDATE']);

        harness.service.activeImports.set('tenant-a:nodicsDocumentation', {
            runId: 'running'
        });
        await assert.rejects(
            harness.service.importPack({
                packCode: 'nodicsDocumentation',
                tenant: 'tenant-a'
            }),
            error => error.code === 'ERR_IMP_00003' && /already running/.test(error.message)
        );
        harness.service.activeImports.delete('tenant-a:nodicsDocumentation');

        fixture.manifest.version = '0.9.0';
        fs.writeFileSync(
            path.join(fixture.repository, 'manifest/generated-content-pack.json'),
            JSON.stringify(fixture.manifest)
        );
        await assert.rejects(
            harness.service.importPack({
                packCode: 'nodicsDocumentation',
                tenant: 'tenant-a'
            }),
            error => error.code === 'ERR_IMP_00003' && /downgrade/.test(error.message)
        );

        let cleanupFixture = createFixture();
        let cleanupFailureHarness = createHarness(cleanupFixture, true);
        let originalRemove = require('fs-extra').remove;
        require('fs-extra').remove = () => Promise.reject(new Error('cleanup failed'));
        cleanupFailureHarness.service.LOG = { error: () => undefined };
        try {
            let cleanupResult = await cleanupFailureHarness.service.importPack({
                packCode: 'nodicsDocumentation',
                tenant: 'tenant-cleanup'
            });
            assert.strictEqual(cleanupResult.data.state, 'CURRENT');
        } finally {
            require('fs-extra').remove = originalRemove;
            fs.rmSync(cleanupFixture.workspace, { recursive: true, force: true });
        }

        console.log('Content-pack import and update contract validated');
    } finally {
        fs.rmSync(fixture.workspace, { recursive: true, force: true });
    }
})().catch(error => {
    console.error(error);
    process.exit(1);
});
