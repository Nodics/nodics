/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

// @nodics-capability-behavior @nodics-area system
const changedConfigs = [];
const activationRequests = [];

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
    },
    changeTenantProperties: function (config, tenant) {
        changedConfigs.push({ config, tenant });
    }
};

global.SERVICE = {
    DefaultRuntimeConfigurationActivationRequestService: {
        createActivationRequest: function (request) {
            activationRequests.push(request.activationRequest);
            return Promise.resolve({
                code: 'SUC_SYS_00000',
                message: 'Runtime configuration activation request created successfully',
                data: { approvalStatus: 'PENDING' }
            });
        }
    },
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
    NodicsError: require('../../nCommon/src/lib/nodicsError')
};

global.FACADE = {
    DefaultConfigurationFacade: require('../src/facade/config/defaultConfigurationFacade')
};

global.SERVICE.DefaultConfigurationService = require('../src/service/config/defaultConfigurationService');

const controller = require('../src/controller/config/defaultConfigurationController');

(async function () {
    let request = {
        tenant: 'electronicsTenant',
        httpRequest: {
            body: {
                featureFlags: {
                    searchEnabled: true
                }
            }
        }
    };

    let response = await controller.changeConfig(request);
    assert.strictEqual(response.code, 'SUC_SYS_00000');
    assert.strictEqual(response.data.approvalStatus, 'PENDING');
    assert.deepStrictEqual(request.config, {
        featureFlags: {
            searchEnabled: true
        }
    });
    assert.deepStrictEqual(changedConfigs, [], 'Direct configuration endpoint must not mutate tenant properties');
    assert.deepStrictEqual(activationRequests, [{
        configurationType: 'propertyConfiguration',
        configurationCode: 'tenantProperties',
        moduleName: 'system',
        configuration: {
            featureFlags: {
                searchEnabled: true
            }
        },
        requestReason: undefined
    }]);

    let emptyConfigError;
    try {
        await controller.changeConfig({
            tenant: 'electronicsTenant',
            httpRequest: {
                body: {}
            }
        });
    } catch (error) {
        emptyConfigError = error;
    }
    assert(emptyConfigError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(emptyConfigError.code, 'ERR_SYS_00001');

    console.log('System configuration capability behavior validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
