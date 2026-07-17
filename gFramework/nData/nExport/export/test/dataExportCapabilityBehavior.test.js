/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
                NodicsError: 'ERR_SYS_00000'
            };
        }
        if (key === 'returnErrorStack') {
            return false;
        }
        return undefined;
    }
};

global.SERVICE = {
    DefaultStatusService: {
        get: function (code) {
            return {
                code: 500,
                message: 'Status message for ' + code
            };
        }
    }
};

global.UTILS = {
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    },
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (this.isObject(value) && Object.keys(value).length === 0);
    },
    extractFromError: function (error, message, defaultCode) {
        return {
            code: defaultCode,
            name: error.name,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message ? error.message + ' : ' + message : error.message,
            stack: error.stack
        };
    },
    extractFromMessage: function (message, defaultCode) {
        return {
            code: defaultCode,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: message
        };
    }
};

global.CLASSES = {
    NodicsError: require('../../../../nCommon/src/lib/nodicsError')
};

global.SERVICE.DataExportService = require('../src/service/DataExportService');
global.FACADE = {
    DataExportFacade: require('../src/facade/DataExportFacade')
};

const controller = require('../src/controller/DataExportController');

(async function () {
    let request = {
        httpRequest: {
            query: {
                schema: 'tenant'
            },
            body: {
                format: 'json'
            }
        }
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
            schema: 'tenant'
        }
    });
    assert(exportError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(exportError.code, 'ERR_SYS_00001');
    assert(exportError.message.includes('Data export service is not configured'));

    let selectedModels = [{
        code: 'product-001',
        internalCost: 99
    }];
    global.SERVICE.DefaultSchemaReadAccessPolicyService = {
        applyExportPolicies: function (policyRequest, policyResponse) {
            assert.strictEqual(policyRequest.tenant, 'electronics');
            assert.strictEqual(policyRequest.schemaModel.schemaName, 'product');
            delete policyResponse.success.result[0].internalCost;
            policyResponse.success.policy = {
                action: 'export',
                appliedCount: 1
            };
            return Promise.resolve(policyResponse);
        }
    };
    let filteredModels = await global.SERVICE.DataExportService.applyExportAccessPolicies({
        tenant: 'electronics',
        schemaModel: {
            schemaName: 'product'
        }
    }, selectedModels);

    assert.deepStrictEqual(filteredModels, [{
        code: 'product-001'
    }]);
    assert.deepStrictEqual(selectedModels, [{
        code: 'product-001',
        internalCost: 99
    }]);

    console.log('Data export capability behavior validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
