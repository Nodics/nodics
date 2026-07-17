/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nValidator/test/validatorServiceContract
 * @description Verifies persisted validator loading, tenant/item/trigger ordering, handler and script execution, and validator change-event refresh dispatch.
 * @layer test
 * @owner nValidator
 * @override Project validators may be added through persisted validator records or layered modules, but must preserve type validation, trigger ordering, tenant isolation, and execution semantics.
 */

const assert = require('assert');

global.ENUMS = {
    ValidatorType: {
        isDefined: function (type) {
            return ['schema', 'import', 'export', 'search', 'workflow', 'job'].includes(type);
        }
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

global.NODICS = {
    getActiveTenants: function () {
        return ['default', 'tenantB'];
    }
};

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (value && typeof value === 'object' && Object.keys(value).length === 0);
    },
    sortObject: function (items, property) {
        return items.reduce((result, item) => {
            let key = item[property];
            if (!result[key]) result[key] = [];
            result[key].push(item);
            return result;
        }, {});
    },
    evaluateScript: function (request, response, script) {
        scriptCalls.push({ request, response, script });
        if (script === 'request.model.active === true') {
            return Promise.resolve(true);
        }
        return Promise.reject(false);
    }
};

const handlerCalls = [];
const scriptCalls = [];
const pipelineCalls = [];

global.SERVICE = {
    DefaultValidatorConfigurationService: require('../src/service/config/defaultValidatorConfigurationService'),
    DefaultSampleValidatorService: {
        handlePreSave: function (request, response) {
            handlerCalls.push({ handler: 'handlePreSave', request, response });
            request.model.defaultHandled = true;
            return Promise.resolve(true);
        },
        handleAddressSave: function (request, response) {
            handlerCalls.push({ handler: 'handleAddressSave', request, response });
            request.model.addressHandled = true;
            return Promise.resolve(true);
        }
    },
    DefaultPipelineService: {
        start: function (pipelineName, request, response) {
            pipelineCalls.push({ pipelineName, request, response });
            return Promise.resolve(true);
        }
    }
};

SERVICE.DefaultValidatorConfigurationService.LOG = {
    error: function () {}
};

const service = require('../src/service/validator/defaultValidatorService');
service.LOG = {
    error: function () {},
    warn: function () {}
};

(async function run() {
    SERVICE.DefaultValidatorConfigurationService.setRawValidators({});
    service.loadRawValidators({
        default: [{
            code: 'defaultPreSaveLate',
            type: 'schema',
            trigger: 'preSave',
            index: 20,
            handler: 'DefaultSampleValidatorService.handlePreSave'
        }, {
            code: 'addressPreSaveEarly',
            type: 'schema',
            item: 'address',
            trigger: 'preSave',
            index: 5,
            handler: 'DefaultSampleValidatorService.handleAddressSave'
        }, {
            code: 'addressScript',
            type: 'schema',
            item: 'address',
            trigger: 'preSave',
            index: 10,
            script: 'request.model.active === true'
        }, {
            code: 'addressPostSave',
            type: 'schema',
            item: 'address',
            trigger: 'postSave',
            index: 1,
            script: 'request.model.active === true'
        }],
        tenantB: [{
            code: 'tenantBImportValidator',
            type: 'import',
            trigger: 'preImport',
            index: 0,
            script: 'request.model.active === true'
        }]
    });

    const addressValidators = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators('default', 'address', 'schema');
    assert.deepStrictEqual(addressValidators.preSave.map(item => item.code), [
        'addressPreSaveEarly',
        'addressScript',
        'defaultPreSaveLate'
    ]);
    assert.deepStrictEqual(addressValidators.postSave.map(item => item.code), ['addressPostSave']);

    const tenantBValidators = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators('tenantB', 'anything', 'import');
    assert.deepStrictEqual(tenantBValidators.preImport.map(item => item.code), ['tenantBImportValidator']);
    assert.throws(() => SERVICE.DefaultValidatorConfigurationService.prepareItemValidators('unknownTenant', 'address', 'schema'), /Tenant is not valid/);

    const request = { tenant: 'default', model: { active: true } };
    const response = {};
    await service.executeValidators(addressValidators.preSave.slice(), request, response);
    assert.deepStrictEqual(handlerCalls.map(call => call.handler), ['handleAddressSave', 'handlePreSave']);
    assert.deepStrictEqual(scriptCalls.map(call => call.script), ['request.model.active === true']);
    assert.strictEqual(request.model.defaultHandled, true);
    assert.strictEqual(request.model.addressHandled, true);

    await assert.rejects(() => service.executeValidators([{
        script: 'request.model.active === false'
    }], request, response));

    await service.handleValidatorChangeEvent({
        tenant: 'default',
        moduleName: 'validator',
        authData: { code: 'admin' },
        event: {
            data: ['address']
        }
    });
    assert.strictEqual(pipelineCalls[0].pipelineName, 'validatorUpdatedPipeline');
    assert.strictEqual(pipelineCalls[0].request.tenant, 'default');
    assert.deepStrictEqual(pipelineCalls[0].request.data, ['address']);

    assert.throws(() => service.loadRawValidators({
        default: [{
            code: 'invalidTypeValidator',
            type: 'not-supported',
            trigger: 'preSave',
            index: 0
        }]
    }), error => error.code === 'ERR_SYS_00000' && error.message.includes('invalidTypeValidator'));

    assert.throws(() => service.loadRawValidators({
        default: [{
            code: 'missingTriggerValidator',
            type: 'schema',
            index: 0
        }]
    }), error => error.code === 'ERR_SYS_00000' && error.message.includes('missingTriggerValidator'));

    console.log('Validator service contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
