/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module gFramework/nEms/emsClient/test/messageTenantResolution.test
 * @description Validates tenant resolution rules for consumed EMS messages, including header, restricted, fallback, and failure paths.
 * @layer test
 * @owner nEms
 * @override Project modules may add tenant policy scenarios for custom queues while preserving this default message tenant contract.
 */

global.CONFIG = {
    get: function (key) {
        if (key === 'defaultTenant') return 'default';
        return undefined;
    }
};

global.CLASSES = {
    NodicsError: function NodicsError(code, message) {
        this.code = code;
        this.message = message;
    }
};

const messageProcessService = require('../src/service/proc/defaultMessageProcessService');

function createService() {
    return Object.assign({}, messageProcessService, {
        LOG: {
            debug: function () {},
            error: function () {}
        }
    });
}

function validateData(queueOptions, message) {
    let state = {};
    let request = {
        queue: {
            name: 'testQueue',
            options: Object.assign({
                header: {}
            }, queueOptions)
        },
        message: message || {}
    };

    createService().validateData(request, {}, {
        error: function (_request, _response, error) {
            state.error = error;
        },
        nextSuccess: function () {
            state.success = true;
        }
    });

    return {
        request: request,
        state: state
    };
}

let messageTenant = validateData({}, {
    tenant: 'customerTenant'
});
assert.strictEqual(messageTenant.state.success, true);
assert.strictEqual(messageTenant.request.message.tenant, 'customerTenant');

let headerTenant = validateData({
    header: {
        tenant: 'headerTenant'
    }
}, {});
assert.strictEqual(headerTenant.state.success, true);
assert.strictEqual(headerTenant.request.message.tenant, 'headerTenant');

let restrictedHeaderTenant = validateData({
    tenantRestricted: true,
    header: {
        tenant: 'restrictedTenant'
    }
}, {
    tenant: 'ignoredTenant'
});
assert.strictEqual(restrictedHeaderTenant.state.success, true);
assert.strictEqual(restrictedHeaderTenant.request.message.tenant, 'restrictedTenant');

let missingTenant = validateData({}, {});
assert.strictEqual(missingTenant.state.error.code, 'ERR_EMS_00000');

let systemQueue = validateData({
    systemQueue: true
}, {});
assert.strictEqual(systemQueue.state.success, true);
assert.strictEqual(systemQueue.request.message.tenant, 'default');
