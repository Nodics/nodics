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

    console.log('Data export capability behavior validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
