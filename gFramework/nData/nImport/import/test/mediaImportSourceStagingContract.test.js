/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/test/mediaImportSourceStagingContract
 * @description Validates nImport staging for nMedia-owned import source files.
 * @layer test
 * @owner import
 * @override Future public routes may call this primitive but must preserve media-reference input and run-owned staging.
 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const service = require('../src/service/media/defaultMediaImportSourceStagingService');

class DataImportError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-media-import-stage-'));
const mediaRoot = path.join(workspace, 'media');
const serverRoot = path.join(workspace, 'server');
fs.mkdirSync(mediaRoot, { recursive: true });
fs.mkdirSync(serverRoot, { recursive: true });
const sourcePath = path.join(mediaRoot, 'tenant-upload.xlsx');
const content = Buffer.from('tenant,description\nsample,Media import staging\n');
fs.writeFileSync(sourcePath, content);
const checksum = crypto.createHash('sha256').update(content).digest('hex');

global.CLASSES = { DataImportError };
global.CONFIG = { get: key => key === 'data' ? { dataDirName: 'temp' } : undefined };
global.NODICS = {
    getServerPath: () => serverRoot
};
global.SERVICE = {
    DefaultMediaImportSourceResolverService: {
        resolve: async request => ({
            mediaCode: request.mediaCode,
            folderCode: 'importSources',
            formatCode: 'importFile',
            providerCode: 'local',
            fileName: 'tenant-upload.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            extension: 'xlsx',
            sizeBytes: content.length,
            checksum: checksum,
            checksumAlgorithm: 'sha256',
            source: {
                absolutePath: sourcePath
            }
        })
    }
};

(async () => {
    let result = await service.stage({
        tenant: 'default',
        importRun: { runId: 'run-001' },
        source: {
            type: 'MEDIA',
            mediaCode: 'tenant-upload'
        }
    });
    assert.strictEqual(result.inputPath.importType, 'media');
    assert.strictEqual(result.inputPath.dataType, 'media');
    assert.strictEqual(result.mediaSource.mediaCode, 'tenant-upload');
    assert.strictEqual(result.mediaSource.providerCode, 'local');
    assert.strictEqual(result.mediaSource.fileName, 'tenant-upload.xlsx');
    assert.strictEqual(fs.existsSync(path.join(result.inputPath.dataPath, 'tenant-upload.xlsx')), true);
    assert.strictEqual(fs.readFileSync(path.join(result.inputPath.dataPath, 'tenant-upload.xlsx'), 'utf8'), content.toString());
    assert.strictEqual(result.mediaSource.source, undefined, 'public staging result must not expose backend source path');

    let prefixedResult = await service.stage({
        tenant: 'default',
        importRun: { runId: 'run-002' },
        dataFilePrefix: 'defaultTenantExcelData',
        source: {
            type: 'MEDIA',
            mediaCode: 'tenant-upload'
        }
    });
    assert.strictEqual(prefixedResult.mediaSource.fileName, 'defaultTenantExcelData.xlsx');
    assert.strictEqual(fs.existsSync(path.join(prefixedResult.inputPath.dataPath, 'defaultTenantExcelData.xlsx')), true);

    await assert.rejects(service.stage({ source: { type: 'URL', mediaCode: 'tenant-upload' } }), error => error.code === 'ERR_IMP_00008');

    global.SERVICE.DefaultMediaImportSourceResolverService.resolve = async () => ({
        mediaCode: 'missing-file',
        folderCode: 'importSources',
        source: { absolutePath: path.join(mediaRoot, 'missing.xlsx') }
    });
    await assert.rejects(service.stage({ source: { type: 'MEDIA', mediaCode: 'missing-file' } }), error => error.code === 'ERR_IMP_00008');

    fs.rmSync(workspace, { recursive: true, force: true });
    console.log('nImport media import source staging contract validated');
})().catch(error => {
    try { fs.rmSync(workspace, { recursive: true, force: true }); } catch (ignore) { /* ignore cleanup failure */ }
    console.error(error);
    process.exit(1);
});
