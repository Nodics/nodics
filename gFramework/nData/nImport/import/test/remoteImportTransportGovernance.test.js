/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * @module import/test/remoteImportTransportGovernance
 * @description Verifies layered adapter resolution, tenant and module allowlists, bounded retries, isolated staging, extension and checksum enforcement, sanitized diagnostics, and cleanup for remote imports.
 * @layer test
 * @owner import
 * @override Projects may add transport fixtures while preserving the framework governance boundary.
 */

const serverPath = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-remote-import-'));
let attempts = 0;
const configuration = {
    dataDirName: 'temp',
    remoteImport: {
        enabled: true,
        defaultTransport: 'fixture',
        cleanupStaging: true,
        policy: {
            timeoutMs: 100,
            retries: 1,
            maxFiles: 2,
            maxFileBytes: 1024,
            maxTotalBytes: 2048,
            allowedExtensions: ['json', 'csv'],
            requireChecksums: true
        },
        transports: {
            fixture: { enabled: true, service: 'FixtureRemoteAdapter' }
        },
        sources: {
            trusted: { enabled: true, transport: 'fixture', tenants: ['tenant-a'], modules: ['profile'], headerDataType: 'core' },
            badType: { enabled: true, service: 'BadTypeRemoteAdapter', transport: 'fixture', tenants: ['tenant-a'], modules: ['profile'] },
            noChecksum: { enabled: true, service: 'NoChecksumRemoteAdapter', transport: 'fixture', tenants: ['tenant-a'], modules: ['profile'] },
            slow: { enabled: true, service: 'SlowRemoteAdapter', transport: 'fixture', tenants: ['tenant-a'], modules: ['profile'], policy: { timeoutMs: 5, retries: 0 } }
        }
    }
};

global.CONFIG = {
    /** Returns remote-import fixture configuration. */
    get: function (key) {
        if (key === 'data') return configuration;
        if (key === 'defaultTenant') return 'default';
    }
};
global.NODICS = {
    /** Returns the isolated server-module fixture path. */
    getServerPath: function () { return serverPath; }
};
global.CLASSES = {
    DataImportError: class DataImportError extends Error {
        constructor(error, message, code) {
            super(message || error && error.message || String(error));
            this.code = code || typeof error === 'string' && error || 'ERR_IMP_00000';
        }
    }
};

function writeFixture(context, name, content, includeChecksum = true) {
    const filePath = path.join(context.targetPath, name);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
    return {
        rootPath: context.targetPath,
        files: [{ path: name, sha256: includeChecksum ? crypto.createHash('sha256').update(content).digest('hex') : undefined }]
    };
}

global.SERVICE = {
    FixtureRemoteAdapter: {
        /** Fails once and then stages one checksummed JSON fixture. */
        stage: function (context) {
            attempts++;
            if (attempts === 1) return Promise.reject(new Error('temporary transport failure'));
            return Promise.resolve(writeFixture(context, 'profileData.json', '{"records":[]}'));
        }
    },
    BadTypeRemoteAdapter: {
        /** Stages an executable JavaScript fixture that governance must reject. */
        stage: function (context) { return Promise.resolve(writeFixture(context, 'unsafe.js', 'module.exports = {};')); }
    },
    NoChecksumRemoteAdapter: {
        /** Stages data without the mandatory integrity digest. */
        stage: function (context) { return Promise.resolve(writeFixture(context, 'unchecked.json', '{}', false)); }
    },
    SlowRemoteAdapter: {
        /** Never completes so the framework timeout contract can fail closed. */
        stage: function () { return new Promise(() => {}); }
    }
};

const service = require('../src/service/remote/defaultRemoteImportTransportService');

(async function () {
    const request = { tenant: 'tenant-a', modules: ['profile'], remoteImport: { source: 'trusted' }, importRun: { runId: 'remote/test' } };
    const stage = await service.stage(request);
    assert.strictEqual(attempts, 2);
    assert.strictEqual(stage.fileCount, 1);
    assert.strictEqual(request.importRun.remote.source, 'trusted');
    assert.strictEqual(request.importRun.remote.transport, 'fixture');
    assert.strictEqual(request.importRun.remote.attempts, 2);
    assert(!JSON.stringify(request.importRun.remote).includes('targetPath'));
    assert(stage.rootPath.startsWith(serverPath));
    await service.cleanup(request);
    assert.strictEqual(fs.existsSync(stage.rootPath), false);

    assert.throws(() => service.resolve({ tenant: 'tenant-b', modules: ['profile'], remoteImport: { source: 'trusted' } }), /not allowed for tenant/);
    assert.throws(() => service.resolve({ tenant: 'tenant-a', modules: ['workflow'], remoteImport: { source: 'trusted' } }), /does not allow modules/);
    await assert.rejects(service.stage({ tenant: 'tenant-a', modules: ['profile'], remoteImport: { source: 'badType' }, importRun: { runId: 'bad-type' } }), /file type is not allowed/);
    await assert.rejects(service.stage({ tenant: 'tenant-a', modules: ['profile'], remoteImport: { source: 'noChecksum' }, importRun: { runId: 'no-checksum' } }), /checksum is required/);
    await assert.rejects(service.stage({ tenant: 'tenant-a', modules: ['profile'], remoteImport: { source: 'slow' }, importRun: { runId: 'slow' } }), /timed out/);
    console.log('Remote import transport governance validated');
})().finally(() => fs.rmSync(serverPath, { recursive: true, force: true })).catch(error => {
    console.error(error);
    process.exit(1);
});
