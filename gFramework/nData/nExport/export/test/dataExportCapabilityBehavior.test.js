/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nExport/export/test/dataExportCapabilityBehavior
 * @description Verifies export request normalization, fail-closed default
 * behavior, export access-policy delegation, and export-safe model copy
 * handling.
 * @layer test
 * @owner export
 * @override Project modules should add implementation-specific export tests
 * while preserving these shared export engine contracts.
 */

const assert = require('assert');

// @nodics-capability-behavior @nodics-area system
global.CONFIG = {
    get: function (key) {
        if (key === 'defaultErrorCodes') {
            return {
                NodicsError: 'ERR_SYS_00000',
            };
        }
        if (key === 'dataExport') {
            return {
                enabled: true,
                allowedFormats: ['csv', 'json'],
                defaultFormat: 'csv',
                maximumRecords: 100,
                pageSize: 10,
                media: {
                    folderCode: 'exportFiles',
                    formatCode: 'exportFile',
                },
            };
        }
        if (key === 'returnErrorStack') {
            return false;
        }
        return undefined;
    },
};

global.SERVICE = {
    DefaultStatusService: {
        get: function (code) {
            return {
                code: 500,
                message: 'Status message for ' + code,
            };
        },
    },
};

global.UTILS = {
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    isBlank: function (value) {
        return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0) || (this.isObject(value) && Object.keys(value).length === 0);
    },
    extractFromError: function (error, message, defaultCode) {
        return {
            code: defaultCode,
            name: error.name,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message ? error.message + ' : ' + message : error.message,
            stack: error.stack,
        };
    },
    extractFromMessage: function (message, defaultCode) {
        return {
            code: defaultCode,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message,
        };
    },
};

global.CLASSES = {
    NodicsError: require('../../../../nCommon/src/lib/nodicsError'),
};

global.SERVICE.DataExportService = require('../src/service/DataExportService');
global.FACADE = {
    DataExportFacade: require('../src/facade/DataExportFacade'),
};

const controller = require('../src/controller/DataExportController');
const routerConfig = require('../src/router/routers');

(async function () {
    let request = {
        httpRequest: {
            query: {
                schema: 'tenant',
            },
            body: {
                format: 'json',
            },
        },
    };

    let exportError;
    try {
        await controller.export(request);
    } catch (error) {
        exportError = error;
    }

    assert.deepStrictEqual(request.export, {
        format: 'json',
        query: {
            schema: 'tenant',
        },
    });
    assert(exportError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(exportError.code, 'ERR_EXP_00001');
    assert(exportError.message.includes('Export module is invalid'));

    let selectedModels = [
        {
            code: 'product-001',
            internalCost: 99,
        },
    ];
    global.SERVICE.DefaultSchemaReadAccessPolicyService = {
        applyExportPolicies: function (policyRequest, policyResponse) {
            if (policyRequest.schemaModel.schemaName === 'product') {
                assert.strictEqual(policyRequest.tenant, 'electronics');
            }
            delete policyResponse.success.result[0].internalCost;
            policyResponse.success.policy = {
                action: 'export',
                appliedCount: 1,
            };
            return Promise.resolve(policyResponse);
        },
    };
    let filteredModels = await global.SERVICE.DataExportService.applyExportAccessPolicies(
        {
            tenant: 'electronics',
            schemaModel: {
                schemaName: 'product',
            },
        },
        selectedModels,
    );

    assert.deepStrictEqual(filteredModels, [
        {
            code: 'product-001',
        },
    ]);
    assert.deepStrictEqual(selectedModels, [
        {
            code: 'product-001',
            internalCost: 99,
        },
    ]);

    global.SERVICE.DefaultSchemaWorkbenchService = {
        get: function (workbenchRequest) {
            assert.strictEqual(workbenchRequest.moduleName, 'profile');
            assert.strictEqual(workbenchRequest.httpRequest.params.schema, 'tenant');
            return Promise.resolve({
                data: {
                    label: 'Tenant',
                    fields: [
                        { name: 'code', type: 'string' },
                        { name: 'description', type: 'string' },
                        { name: 'properties', type: 'object' },
                    ],
                    queryCapabilities: {
                        allowedPageSizes: [10],
                        defaultPageSize: 10,
                        maximumPageSize: 10,
                        defaultSort: { field: 'code', direction: 'ASC' },
                        sortableFields: ['code'],
                    },
                },
            });
        },
        search: function (workbenchRequest) {
            assert.strictEqual(workbenchRequest.moduleName, 'profile');
            assert.strictEqual(workbenchRequest.httpRequest.params.schema, 'tenant');
            assert.strictEqual(workbenchRequest.httpRequest.body.pageSize, 10);
            return Promise.resolve({
                data: {
                    records: [
                        {
                            code: 'default',
                            description: 'Default tenant',
                            internalCost: 99,
                        },
                        {
                            code: 'qa',
                            description: 'QA tenant',
                            internalCost: 88,
                        },
                    ],
                    totalCount: 2,
                },
            });
        },
    };
    global.SERVICE.DefaultMediaUploadService = {
        upload: function (mediaRequest) {
            assert.strictEqual(mediaRequest.folderCode, 'exportFiles');
            assert.strictEqual(mediaRequest.formatCode, 'exportFile');
            assert.strictEqual(mediaRequest.moduleName, 'profile');
            assert.strictEqual(mediaRequest.schemaName, 'tenant');
            assert.strictEqual(mediaRequest.files.length, 1);
            assert(Buffer.isBuffer(mediaRequest.files[0].buffer));
            return Promise.resolve({
                code: 'tenant-export-test',
                accessUrl: '/nodics/media/v0/content/tenant-export-test',
                originalFileName: mediaRequest.files[0].originalFileName,
            });
        },
    };
    global.NODICS = {
        getModels: function (moduleName, tenant) {
            assert.strictEqual(moduleName, 'profile');
            assert.strictEqual(tenant, 'default');
            return {
                Tenant: {
                    schemaName: 'tenant',
                },
            };
        },
    };
    global.UTILS.createModelName = function (schemaName) {
        return schemaName.charAt(0).toUpperCase() + schemaName.slice(1);
    };

    let exportResult = await global.SERVICE.DataExportService.export({
        tenant: 'default',
        authData: {
            enterprise: {
                code: 'default',
            },
        },
        export: {
            moduleName: 'profile',
            schemaName: 'tenant',
            format: 'csv',
            query: {
                search: 'default',
            },
        },
    });

    assert.strictEqual(exportResult.code, 'SUC_SYS_00000');
    assert.strictEqual(exportResult.data.media.code, 'tenant-export-test');
    assert.strictEqual(exportResult.data.summary.exportedRecords, 2);

    assert.strictEqual(typeof controller.downloadGeneratedExport, 'undefined', 'nExport must not expose a duplicate download controller operation');
    assert.strictEqual(typeof global.FACADE.DataExportFacade.downloadGeneratedExport, 'undefined', 'nExport must not expose a duplicate download facade operation');
    assert.strictEqual(typeof global.SERVICE.DataExportService.downloadGeneratedExport, 'undefined', 'nExport must not expose a duplicate download service operation');
    const exportRoute = routerConfig.export.dataExport.exportPost;
    assert.strictEqual(exportRoute.key, '/export');
    assert.strictEqual(exportRoute.controller, 'DataExportController');
    assert.strictEqual(exportRoute.operation, 'export');
    assert.strictEqual(exportRoute.permission, 'export.run');
    assert.strictEqual(exportRoute.apiExposure, 'dataExport');

    console.log('Data export capability behavior validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
