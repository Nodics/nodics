/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCommon/test/executionLayerTraceability
 * @description Verifies that processor, search processor, interceptor, and event failures retain handler, tenant, module, schema/index, and event execution context.
 * @layer test
 * @owner nCommon
 * @override New execution layers should add traceability scenarios without weakening the shared context contract.
 */
const assert = require('assert');

String.prototype.toUpperCaseFirstChar = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

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
    DefaultProcessorTargetService: {
        fail: function () {
            return Promise.reject(new global.CLASSES.NodicsError('ERR_PROC_00000', 'Processor failed'));
        }
    },
    DefaultInterceptorTargetService: {
        fail: function () {
            return Promise.reject(new global.CLASSES.NodicsError('ERR_INTR_00000', 'Interceptor failed'));
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
    NodicsError: require('../src/lib/nodicsError')
};

const processorService = require('../src/service/processor/defaultProcessorHandlerService');
const interceptorService = require('../src/service/interceptor/defaultInterceptorService');
const eventService = require('../../nEvent/src/service/event/defaultEventService');

global.NODICS = {
    getModule: function () {
        return null;
    }
};

(async function () {
    let request = {
        tenant: 'test',
        moduleName: 'catalog',
        schemaModel: {
            schemaName: 'Catalog',
            moduleName: 'catalog'
        },
        indexName: 'catalogIndex'
    };

    try {
        await processorService.executeProcessors([{
            handler: 'DefaultProcessorTargetService.fail'
        }], request, {});
        assert.fail('Expected processor failure');
    } catch (error) {
        let context = error.contexts.find(item => item.layer === 'processor');
        assert.ok(context);
        assert.strictEqual(context.processorType, 'model');
        assert.strictEqual(context.handler, 'DefaultProcessorTargetService.fail');
        assert.strictEqual(context.tenant, 'test');
        assert.strictEqual(context.schemaName, 'Catalog');
    }

    try {
        await processorService.executeSearchProcessors(['DefaultProcessorTargetService.fail'], request, {});
        assert.fail('Expected search processor failure');
    } catch (error) {
        let context = error.contexts.find(item => item.layer === 'processor' && item.processorType === 'search');
        assert.ok(context);
        assert.strictEqual(context.handler, 'DefaultProcessorTargetService.fail');
        assert.strictEqual(context.indexName, 'catalogIndex');
    }

    try {
        await interceptorService.executeInterceptors([{
            handler: 'DefaultInterceptorTargetService.fail'
        }], request, {});
        assert.fail('Expected interceptor failure');
    } catch (error) {
        let context = error.contexts.find(item => item.layer === 'interceptor');
        assert.ok(context);
        assert.strictEqual(context.handler, 'DefaultInterceptorTargetService.fail');
        assert.strictEqual(context.tenant, 'test');
        assert.strictEqual(context.schemaName, 'Catalog');
    }

    try {
        await eventService.handleEvent({
            moduleName: 'catalog',
            event: {
                tenant: 'test',
                event: 'saveModels',
                sourceName: 'catalogSource',
                sourceId: 'node0',
                target: 'catalog',
                targetType: 'MODULE',
                type: 'SYNC',
                state: 'NEW'
            }
        });
        assert.fail('Expected event failure');
    } catch (error) {
        let context = error.contexts.find(item => item.layer === 'event' && item.phase === 'handle');
        assert.ok(context);
        assert.strictEqual(context.eventName, 'saveModels');
        assert.strictEqual(context.tenant, 'test');
        assert.strictEqual(context.sourceName, 'catalogSource');
        assert.strictEqual(context.target, 'catalog');
        assert.strictEqual(context.moduleName, 'catalog');
    }
})();
