/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module router/test/RequestPipelineResponseContract
 * @description Verifies that the Nodics request pipeline validates request data,
 * resolves non-secured enterprise/tenant context, hands the request to the selected
 * controller, and returns standard JSON response objects for success and error flows.
 * @layer test
 * @owner nRouter
 * @override Project modules may add equivalent request pipeline contract tests for
 * custom response handlers, secured branches, or controller handoff rules.
 */

const assert = require('assert');
const crypto = require('crypto');
const _ = require('lodash');

// @nodics-capability-behavior @nodics-area router
if (!String.prototype.toUpperCaseFirstChar) {
    Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', {
        value: function () {
            return this.charAt(0).toUpperCase() + this.slice(1);
        },
        configurable: true
    });
}

const statusCodes = {
    SUC_TEST_00000: { code: '200', message: 'Controller request processed successfully' },
    SUC_SYS_00000: { code: '200', message: 'Process completed successfully' },
    ERR_TEST_00000: { code: '409', message: 'Controller rejected request' },
    ERR_AUTH_00002: { code: '401', message: 'Authentication or enterprise header is required' },
    ERR_AUTH_00003: { code: '403', message: 'Access denied' },
    ERR_ENT_00000: { code: '400', message: 'Enterprise code is not valid' },
    ERR_TNT_00000: { code: '400', message: 'Tenant is null or invalid' },
    ERR_PIPE_00000: { code: '500', message: 'Pipeline configuration is invalid' },
    ERR_SYS_00000: { code: '500', message: 'Process failed with errors' }
};

const logs = [];
let apiExposure = undefined;
const logger = {
    debug: function () {},
    warn: function (message) {
        logs.push({ level: 'warn', message: message });
    },
    error: function (message) {
        logs.push({ level: 'error', message: message });
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'responseHandler') {
            return { jsonResponseHandler: 'DefaultJsonResponseHandlerService' };
        }
        if (key === 'defaultTenant') {
            return 'default';
        }
        if (key === 'defaultErrorCodes') {
            return { NodicsError: 'ERR_SYS_00000' };
        }
        if (key === 'cache') {
            return { enabled: false, cacheability: { logSkippedReason: false } };
        }
        if (key === 'apiExposure') {
            return apiExposure;
        }
        if (key === 'returnErrorStack') {
            return false;
        }
        return undefined;
    }
};

global.UTILS = {
    generateUniqueCode: function () {
        return 'request-contract-id';
    },
    generateHash: function (value) {
        return crypto.createHash('sha1').update(String(value)).digest('hex');
    },
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (_.isArray(value) && value.length === 0) ||
            (_.isObject(value) && !_.isArray(value) && Object.keys(value).length === 0);
    },
    isObject: function (value) {
        return _.isPlainObject(value);
    },
    isApiCashable: function () {
        return false;
    },
    extractFromError: function (error, message, defaultCode) {
        let status = global.SERVICE.DefaultStatusService.get(defaultCode);
        return {
            code: defaultCode,
            responseCode: status.code,
            message: message || error.message || status.message,
            name: error.name,
            stack: error.stack
        };
    },
    extractFromMessage: function (message, defaultCode) {
        let status = global.SERVICE.DefaultStatusService.get(defaultCode);
        return {
            code: defaultCode,
            responseCode: status.code,
            message: message || status.message
        };
    }
};

global.CLASSES = {
    NodicsError: require('../../nCommon/src/lib/nodicsError'),
    PipelineHead: require('../../nPipeline/src/lib/pipelineHead'),
    PipelineNode: require('../../nPipeline/src/lib/pipelineNode')
};

global.PIPELINE = _.merge(
    {},
    require('../../nPipeline/src/pipelines/pipelines'),
    require('../src/pipelines/pipelines')
);

let controllerCalls = [];
global.CONTROLLER = {
    DefaultContractController: {
        success: function (request, callback) {
            controllerCalls.push({
                operation: 'success',
                tenant: request.tenant,
                entCode: request.entCode,
                body: request.body
            });
            callback(null, {
                code: 'SUC_TEST_00000',
                result: {
                    accepted: true,
                    tenant: request.tenant,
                    entCode: request.entCode,
                    body: request.body
                }
            });
        },
        live: function (request, callback) {
            controllerCalls.push({
                operation: 'live',
                tenant: request.tenant,
                entCode: request.entCode
            });
            callback(null, {
                code: 'SUC_TEST_00000',
                data: {
                    status: 'UP'
                }
            });
        },
        fail: function (request, callback) {
            controllerCalls.push({
                operation: 'fail',
                tenant: request.tenant,
                entCode: request.entCode
            });
            callback(new global.CLASSES.NodicsError('ERR_TEST_00000'));
        }
    }
};

global.SERVICE = {
    DefaultStatusService: {
        get: function (code) {
            if (!statusCodes[code]) {
                throw new Error('Unexpected status code lookup: ' + code);
            }
            return statusCodes[code];
        }
    },
    DefaultLoggerService: {
        createLogger: function () {
            return logger;
        }
    },
    DefaultPipelineService: Object.assign({}, require('../../nPipeline/src/service/pipeline/defaultPipelineService'), { LOG: logger }),
    DefaultRouterOperationService: Object.assign({}, require('../src/service/router/defaultRouterOperationService'), { LOG: logger }),
    DefaultRouterService: {
        LOG: logger
    },
    DefaultRequestHandlerService: Object.assign({}, require('../src/service/defaultRequestHandlerService'), { LOG: logger }),
    DefaultRequestHandlerPipelineService: Object.assign({}, require('../src/service/request/defaultRequestHandlerPipelineService'), { LOG: logger }),
    DefaultNonSecuredRequestPipelineService: Object.assign({}, require('../src/service/request/defaultNonSecuredRequestPipelineService'), { LOG: logger }),
    DefaultJsonResponseHandlerService: Object.assign({}, require('../src/service/handlers/response/defaultJsonResponseHandlerService'), { LOG: logger }),
    DefaultCacheConfigurationService: {
        createApiKey: function (request) {
            return [request.method, request.originalUrl, request.tenant || 'none'].join(':');
        }
    },
    DefaultCacheService: {
        getRouterCacheChannel: function (routerName) {
            return routerName + 'Cache';
        },
        get: function () {
            return Promise.reject(new global.CLASSES.NodicsError({
                code: 'ERR_CACHE_00001',
                message: 'Cache miss'
            }));
        },
        put: function () {
            return Promise.resolve(true);
        }
    },
    DefaultCachePolicyService: {
        isApiCacheable: function () {
            return {
                cacheable: false,
                reason: 'Request pipeline contract disables cache',
                reasonCode: 'RSN_TEST_00000'
            };
        }
    },
    DefaultEnterpriseProviderService: {
        loadEnterprise: function (request) {
            return Promise.resolve({
                code: request.entCode,
                tenant: {
                    code: 'contractTenant'
                }
            });
        }
    }
};

global.NODICS = {
    getRouter: function (routerName, moduleName) {
        return Object.assign(createRoute('success'), {
            routerName: routerName,
            moduleName: moduleName,
            active: false
        });
    }
};

function createHttpRequest(headers, body) {
    let normalizedHeaders = {};
    Object.keys(headers || {}).forEach(key => {
        normalizedHeaders[key.toLowerCase()] = headers[key];
    });
    return {
        protocol: 'http',
        hostname: 'localhost',
        originalUrl: '/contract/pipeline',
        method: 'POST',
        body: body || {},
        get: function (name) {
            return normalizedHeaders[String(name).toLowerCase()];
        }
    };
}

function createHttpResponse() {
    return {
        statusCode: undefined,
        payload: undefined,
        status: function (statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json: function (payload) {
            this.payload = payload;
            return this;
        }
    };
}

function createRoute(operation) {
    return {
        routerName: 'contractPipelineRoute',
        moduleName: 'nRouter',
        secured: false,
        controller: 'DefaultContractController',
        operation: operation,
        responseHandler: 'jsonResponseHandler',
        active: true,
        cache: {
            enabled: false
        }
    };
}

function waitForResponse(response) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        let timer = setInterval(() => {
            attempts += 1;
            if (response.payload) {
                clearInterval(timer);
                resolve(response);
            } else if (attempts > 50) {
                clearInterval(timer);
                reject(new Error('Timed out waiting for request pipeline response'));
            }
        }, 10);
    });
}

async function execute(operation, headers, body) {
    return executeRoute(createRoute(operation), headers, body);
}

async function executeRoute(route, headers, body) {
    let response = createHttpResponse();
    global.SERVICE.DefaultRequestHandlerService.startRequestHandler(
        createHttpRequest(headers, body),
        response,
        route
    );
    return waitForResponse(response);
}

(async function run() {
    controllerCalls = [];
    let successResponse = await execute('success', {
        'x-enterprise-code': 'contractEnterprise'
    }, {
        name: 'sample'
    });

    assert.strictEqual(successResponse.statusCode, 200);
    assert.strictEqual(successResponse.payload.code, 'SUC_TEST_00000');
    assert.strictEqual(successResponse.payload.responseCode, '200');
    assert.strictEqual(successResponse.payload.message, 'Controller request processed successfully');
    assert.deepStrictEqual(successResponse.payload.result, {
        accepted: true,
        tenant: 'contractTenant',
        entCode: 'contractEnterprise',
        body: {
            name: 'sample'
        }
    });
    assert.deepStrictEqual(controllerCalls, [{
        operation: 'success',
        tenant: 'contractTenant',
        entCode: 'contractEnterprise',
        body: {
            name: 'sample'
        }
    }]);

    controllerCalls = [];
    let controllerErrorResponse = await execute('fail', {
        'x-enterprise-code': 'contractEnterprise'
    });

    assert.strictEqual(controllerErrorResponse.statusCode, 409);
    assert.strictEqual(controllerErrorResponse.payload.code, 'ERR_TEST_00000');
    assert.strictEqual(controllerErrorResponse.payload.responseCode, '409');
    assert.strictEqual(controllerErrorResponse.payload.message, 'Controller rejected request');
    assert.strictEqual(controllerErrorResponse.payload.contexts.length >= 2, true);
    assert.deepStrictEqual(controllerCalls, [{
        operation: 'fail',
        tenant: 'contractTenant',
        entCode: 'contractEnterprise'
    }]);

    controllerCalls = [];
    let validationErrorResponse = await execute('success', {});

    assert.strictEqual(validationErrorResponse.statusCode, 401);
    assert.strictEqual(validationErrorResponse.payload.code, 'ERR_AUTH_00002');
    assert.strictEqual(validationErrorResponse.payload.responseCode, '401');
    assert.strictEqual(validationErrorResponse.payload.message, 'Authentication or enterprise header is required');
    assert.deepStrictEqual(controllerCalls, []);

    controllerCalls = [];
    let publicProbeResponse = await executeRoute(Object.assign(createRoute('live'), {
        publicProbe: true
    }), {});

    assert.strictEqual(publicProbeResponse.statusCode, 200);
    assert.strictEqual(publicProbeResponse.payload.code, 'SUC_TEST_00000');
    assert.deepStrictEqual(publicProbeResponse.payload.data, { status: 'UP' });
    assert.deepStrictEqual(controllerCalls, [{
        operation: 'live',
        tenant: undefined,
        entCode: undefined
    }]);

    controllerCalls = [];
    let publicDocumentationResponse = await executeRoute(Object.assign(createRoute('success'), {
        publicAccess: true,
        apiExposure: 'openApiContract'
    }), {});

    assert.strictEqual(publicDocumentationResponse.statusCode, 200);
    assert.strictEqual(publicDocumentationResponse.payload.code, 'SUC_TEST_00000');
    assert.deepStrictEqual(publicDocumentationResponse.payload.result, {
        accepted: true,
        tenant: undefined,
        entCode: undefined,
        body: {}
    });
    assert.deepStrictEqual(controllerCalls, [{
        operation: 'success',
        tenant: undefined,
        entCode: undefined,
        body: {}
    }]);

    controllerCalls = [];
    let tenantScopedPublicResponse = await executeRoute(Object.assign(createRoute('success'), {
        publicAccess: true
    }), {
        'x-enterprise-code': 'contractEnterprise'
    });

    assert.strictEqual(tenantScopedPublicResponse.statusCode, 200);
    assert.deepStrictEqual(tenantScopedPublicResponse.payload.result, {
        accepted: true,
        tenant: 'contractTenant',
        entCode: 'contractEnterprise',
        body: {}
    });
    assert.deepStrictEqual(controllerCalls, [{
        operation: 'success',
        tenant: 'contractTenant',
        entCode: 'contractEnterprise',
        body: {}
    }]);

    controllerCalls = [];
    let persistedOpenApiRouteResponse = await executeRoute(Object.assign(createRoute('success'), {
        secured: true,
        apiExposure: 'openApiContract'
    }), {});

    assert.strictEqual(persistedOpenApiRouteResponse.statusCode, 200);
    assert.strictEqual(persistedOpenApiRouteResponse.payload.code, 'SUC_TEST_00000');
    assert.deepStrictEqual(persistedOpenApiRouteResponse.payload.result, {
        accepted: true,
        tenant: undefined,
        entCode: undefined,
        body: {}
    });
    assert.deepStrictEqual(controllerCalls, [{
        operation: 'success',
        tenant: undefined,
        entCode: undefined,
        body: {}
    }]);

    controllerCalls = [];
    apiExposure = {
        default: { enabled: true },
        categories: {
            testExecution: { enabled: false }
        }
    };
    let disabledExposureRoute = Object.assign(createRoute('success'), {
        apiExposure: 'testExecution'
    });
    let disabledExposureResponse = await executeRoute(disabledExposureRoute, {
        'x-enterprise-code': 'contractEnterprise'
    });

    assert.strictEqual(disabledExposureResponse.statusCode, 403);
    assert.strictEqual(disabledExposureResponse.payload.code, 'ERR_AUTH_00003');
    assert.strictEqual(disabledExposureResponse.payload.responseCode, '403');
    assert.strictEqual(disabledExposureResponse.payload.message, 'Access denied: API category is disabled for this runtime: testExecution');
    assert.deepStrictEqual(controllerCalls, []);
    apiExposure = undefined;

    let inactiveRouteResponse = createHttpResponse();
    global.SERVICE.DefaultRouterOperationService.bindOperation(
        createHttpRequest({}, {}),
        inactiveRouteResponse,
        createRoute('success')
    );

    assert.strictEqual(inactiveRouteResponse.statusCode, 500);
    assert.strictEqual(inactiveRouteResponse.payload.code, 'ERR_SYS_00000');
    assert.strictEqual(inactiveRouteResponse.payload.responseCode, '500');
    assert.strictEqual(inactiveRouteResponse.payload.message, 'This API is no more active currently');
    assert.deepStrictEqual(inactiveRouteResponse.payload.metadata, {
        routerName: 'contractPipelineRoute',
        moduleName: 'nRouter'
    });
    assert.deepStrictEqual(controllerCalls, []);

    console.log('Request pipeline response contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
