const assert = require('assert');

// @nodics-capability-behavior @nodics-area system
const changedConfigs = [];

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
    assert.deepStrictEqual(request.config, {
        featureFlags: {
            searchEnabled: true
        }
    });
    assert.deepStrictEqual(changedConfigs, [{
        tenant: 'electronicsTenant',
        config: {
            featureFlags: {
                searchEnabled: true
            }
        }
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
