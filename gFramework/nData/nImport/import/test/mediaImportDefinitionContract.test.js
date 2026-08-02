/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/test/mediaImportDefinitionContract
 * @description Validates importDefinition-owned header generation for media-backed imports.
 * @layer test
 * @owner import
 * @override Projects may add richer import definitions while preserving mediaCode input and standard header generation.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const service = require('../src/service/media/defaultMediaImportDefinitionService');

class DataImportError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-media-import-definition-'));

global.CLASSES = { DataImportError };
global.CONFIG = { get: key => key === 'defaultTenant' ? 'default' : undefined };
global.SERVICE = {
    DefaultImportDefinitionService: {
        get: async () => ({
            result: [{
                code: 'tenantCsv',
                enabled: true,
                active: true,
                moduleName: 'profile',
                schemaName: 'tenant',
                operation: 'saveAll',
                tenants: ['default'],
                dataFilePrefix: 'defaultTenantCsvData',
                query: { code: '$code' },
                allowedExtensions: ['csv']
            }]
        })
    },
    DefaultMediaImportSourceStagingService: {
        stage: async request => ({
            inputPath: {
                rootPath: workspace,
                dataPath: path.join(workspace, 'data'),
                successPath: path.join(workspace, 'success'),
                errorPath: path.join(workspace, 'error'),
                importType: 'media'
            },
            mediaSource: {
                mediaCode: request.mediaCode,
                fileName: request.dataFilePrefix + '.csv',
                extension: 'csv'
            },
            stagedFile: {
                fileName: request.dataFilePrefix + '.csv'
            }
        })
    }
};

(async () => {
    let prepared = await service.prepare({
        tenant: 'default',
        mediaCode: 'tenant-upload',
        definitionCode: 'tenantCsv',
        source: { type: 'MEDIA', mediaCode: 'tenant-upload' }
    });
    assert.strictEqual(prepared.inputPath.headerPath, path.join(workspace, 'headers'));
    assert.strictEqual(prepared.importDefinition.code, 'tenantCsv');
    assert.strictEqual(prepared.importDefinition.dataFilePrefix, 'defaultTenantCsvData');
    let headerFile = path.join(workspace, 'headers', 'tenantCsvHeader.js');
    assert.strictEqual(fs.existsSync(headerFile), true);
    delete require.cache[require.resolve(headerFile)];
    let header = require(headerFile);
    assert.strictEqual(header.profile.tenantCsv.options.schemaName, 'tenant');
    assert.strictEqual(header.profile.tenantCsv.options.dataFilePrefix, 'defaultTenantCsvData');
    assert.deepStrictEqual(header.profile.tenantCsv.options.tenants, ['default']);
    assert.deepStrictEqual(header.profile.tenantCsv.query, { code: '$code' });

    let genericWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-media-import-generic-'));
    global.SERVICE.DefaultMediaImportSourceStagingService.stage = async request => ({
        inputPath: {
            rootPath: genericWorkspace,
            dataPath: path.join(genericWorkspace, 'data'),
            successPath: path.join(genericWorkspace, 'success'),
            errorPath: path.join(genericWorkspace, 'error'),
            importType: 'media'
        },
        mediaSource: {
            mediaCode: request.mediaCode,
            fileName: request.dataFilePrefix + '.csv',
            extension: 'csv'
        },
        stagedFile: {
            fileName: request.dataFilePrefix + '.csv'
        }
    });
    let generic = await service.prepare({
        tenant: 'default',
        mediaCode: 'tenant-upload',
        moduleName: 'profile',
        schemaName: 'tenant',
        definitionCode: '',
        source: { type: 'MEDIA', mediaCode: 'tenant-upload', definitionCode: '' }
    });
    assert.strictEqual(generic.importDefinition.code, 'generic_profile_tenant');
    assert.strictEqual(generic.importDefinition.dataFilePrefix, 'tenantImportData');
    let genericHeaderFile = path.join(genericWorkspace, 'headers', 'generic_profile_tenantHeader.js');
    assert.strictEqual(fs.existsSync(genericHeaderFile), true);
    delete require.cache[require.resolve(genericHeaderFile)];
    let genericHeader = require(genericHeaderFile);
    assert.strictEqual(genericHeader.profile.generic_profile_tenant.options.schemaName, 'tenant');
    assert.strictEqual(genericHeader.profile.generic_profile_tenant.options.operation, 'saveAll');
    assert.strictEqual(genericHeader.profile.generic_profile_tenant.options.dataFilePrefix, 'tenantImportData');
    assert.deepStrictEqual(genericHeader.profile.generic_profile_tenant.options.tenants, ['default']);
    assert.deepStrictEqual(genericHeader.profile.generic_profile_tenant.query, { code: '$code' });
    fs.rmSync(genericWorkspace, { recursive: true, force: true });

    global.SERVICE.DefaultImportDefinitionService.get = async () => ({ result: [] });
    await assert.rejects(service.prepare({
        tenant: 'default',
        mediaCode: 'tenant-upload',
        definitionCode: 'missingDefinition',
        source: { type: 'MEDIA', mediaCode: 'tenant-upload' }
    }), error => error.code === 'ERR_IMP_00009');

    fs.rmSync(workspace, { recursive: true, force: true });
    console.log('nImport media import definition contract validated');
})().catch(error => {
    try { fs.rmSync(workspace, { recursive: true, force: true }); } catch (ignore) { /* ignore cleanup failure */ }
    console.error(error);
    process.exit(1);
});
