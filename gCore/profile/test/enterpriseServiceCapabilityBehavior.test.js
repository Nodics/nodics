const assert = require('assert');

// @nodics-capability-behavior @nodics-area profile
let configValues = {
    defaultTenant: 'masterTenant',
    defaultErrorCodes: {
        NodicsError: 'ERR_SYS_00000'
    }
};

global.CONFIG = {
    get: function (key) {
        return configValues[key];
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
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
    },
    isObject: function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
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
    NodicsError: require('../../../gFramework/nCommon/src/lib/nodicsError')
};

const enterpriseService = require('../src/service/enterprise/defaultEnterpriseService');

(async function () {
    let getCalls = [];
    let enterprise = {
        code: 'electronics',
        active: true
    };
    let service = Object.assign({}, enterpriseService, {
        get: function (request) {
            getCalls.push(request);
            return Promise.resolve({
                result: [enterprise]
            });
        }
    });

    let result = await service.retrieveEnterprise('electronics');
    assert.strictEqual(result, enterprise);
    assert.deepStrictEqual(getCalls, [{
        tenant: 'masterTenant',
        options: {
            recursive: true
        },
        query: {
            code: 'electronics'
        }
    }]);

    configValues.defaultTenant = undefined;
    getCalls = [];
    result = await service.retrieveEnterprise('healthcare');
    assert.strictEqual(result, enterprise);
    assert.strictEqual(getCalls[0].tenant, 'default');
    assert.deepStrictEqual(getCalls[0].query, { code: 'healthcare' });

    let blankCodeError;
    try {
        await service.retrieveEnterprise('');
    } catch (error) {
        blankCodeError = error;
    }
    assert(blankCodeError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(blankCodeError.code, 'ERR_PRFL_00003');

    let noEnterpriseService = Object.assign({}, enterpriseService, {
        get: function () {
            return Promise.resolve({
                result: []
            });
        }
    });

    let notFoundError;
    try {
        await noEnterpriseService.retrieveEnterprise('missing');
    } catch (error) {
        notFoundError = error;
    }
    assert(notFoundError instanceof global.CLASSES.NodicsError);
    assert.strictEqual(notFoundError.code, 'ERR_PRFL_00003');
    assert(notFoundError.message.includes('missing'));

    console.log('Profile enterprise service capability behavior validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
