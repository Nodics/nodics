/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCommon/test/errorTraceability
 * @description Verifies structured Nodics error wrapping, nested causes, validation errors, safe serialization, and propagation of pipeline/import execution context.
 * @layer test
 * @owner nCommon
 * @override Capability modules may add layer-specific context scenarios while preserving the common error serialization contract.
 */
const assert = require('assert');

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
    },
    DefaultLoggerService: {
        createLogger: function () {
            return {
                debug: function () {},
                error: function () {}
            };
        }
    },
    DefaultFailingService: {
        fail: function (request, response, process) {
            process.error(request, response, new global.CLASSES.NodicsError('ERR_TEST_00000', 'Synthetic failure'));
        }
    },
    DefaultPipelineService: {
        handleErrorEnd: function (request, response, process) {
            process.resolve(response.error);
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
        let errMsg = error.message || global.SERVICE.DefaultStatusService.get(defaultCode).message;
        if (message) {
            errMsg = errMsg + ' : ' + message;
        }
        return {
            code: defaultCode,
            name: error.name,
            responseCode: global.SERVICE.DefaultStatusService.get(defaultCode).code,
            message: errMsg,
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
    NodicsError: require('../src/lib/nodicsError'),
    PipelineNode: require('../../nPipeline/src/lib/pipelineNode')
};

global.CLASSES.PipelineHead = require('../../nPipeline/src/lib/pipelineHead');

(async function () {
    let baseError = new global.CLASSES.NodicsError('ERR_TEST_00000', 'Base message');
    baseError.addContext({
        layer: 'unit',
        step: 'base'
    });
    baseError.addCause(new Error('Low-level cause'));
    baseError.add(new global.CLASSES.NodicsError('ERR_CHILD_00000', 'Child message'));

    let wrappedError = new global.CLASSES.NodicsError(baseError);
    let json = wrappedError.toJson(false);

    assert.strictEqual(json.code, 'ERR_TEST_00000');
    assert.strictEqual(json.name, 'NodicsError');
    assert.strictEqual(json.contexts.length, 1);
    assert.strictEqual(json.contexts[0].layer, 'unit');
    assert.strictEqual(json.causes.length, 1);
    assert.strictEqual(json.errors.length, 1);
    assert.strictEqual(json.errors[0].code, 'ERR_CHILD_00000');

    let enrichedError = global.CLASSES.NodicsError.enrich(new Error('Helper failure'), {
        layer: 'helper',
        emptyValue: '',
        missingValue: undefined
    }, 'ERR_HELPER_00000');
    let enrichedJson = enrichedError.toJson(false);
    assert.strictEqual(enrichedJson.code, 'ERR_HELPER_00000');
    assert.strictEqual(enrichedJson.contexts[0].layer, 'helper');
    assert.strictEqual(enrichedJson.contexts[0].emptyValue, undefined);
    assert.strictEqual(enrichedJson.contexts[0].missingValue, undefined);

    let networkError = new Error('Connection refused');
    networkError.code = 'ECONNREFUSED';
    let normalizedNetworkError = global.CLASSES.NodicsError.enrich(networkError, {
        layer: 'remote-module'
    }, 'ERR_SYS_00000');
    assert.strictEqual(normalizedNetworkError.code, 'ERR_SYS_00000');
    assert.strictEqual(normalizedNetworkError.contexts[0].layer, 'remote-module');

    let pipeline = new global.CLASSES.PipelineHead('tracePipeline', {
        startNode: 'failNode',
        nodes: {
            failNode: {
                handler: 'DefaultFailingService.fail',
                error: 'handleError'
            },
            handleError: {
                handler: 'DefaultPipelineService.handleErrorEnd'
            }
        }
    });
    pipeline.LOG = {
        error: function () {},
        debug: function () {}
    };
    pipeline.buildPipeline();

    let pipelineError = await new Promise((resolve, reject) => {
        pipeline.start('tracePipeline_1', {
            tenant: 'test',
            moduleName: 'catalog',
            importRun: {
                runId: 'import_1'
            },
            header: {
                options: {
                    owningModule: 'catalogOwner',
                    moduleName: 'catalogTarget',
                    schemaName: 'Catalog',
                    operation: 'saveAll'
                }
            }
        }, {}, resolve, reject);
    });

    let pipelineContext = pipelineError.contexts.find(context => context.pipelineName === 'tracePipeline');
    assert.ok(pipelineContext);
    assert.strictEqual(pipelineContext.nodeName, 'failNode');
    assert.strictEqual(pipelineContext.handler, 'DefaultFailingService.fail');
    assert.strictEqual(pipelineContext.tenant, 'test');
    assert.strictEqual(pipelineContext.importRunId, 'import_1');
    assert.strictEqual(pipelineContext.schemaName, 'Catalog');
})();
