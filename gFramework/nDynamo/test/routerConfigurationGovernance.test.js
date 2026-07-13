/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.UTILS = {
    isRouterEnabled: function (moduleName) {
        return moduleName === 'profile';
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

const interceptors = require('../src/interceptors/interceptors');
assert.strictEqual(
    interceptors.checkModuleRouterConfiguration.handler,
    'DefaultRouterConfigurationSaveInterceptorService.checkIfModuleActiveForRouter'
);
assert.strictEqual(
    interceptors.validateRouterConfiguration.handler,
    'DefaultRouterConfigurationSaveInterceptorService.validateRouterConfiguration'
);

const service = require('../src/service/interceptors/defaultRouterConfigurationSaveInterceptorService');
let request = {
    model: {
        moduleName: 'profile',
        code: 'runtimeUser',
        key: '/runtime/users/:id',
        method: 'GET',
        controller: 'RuntimeUserController',
        operation: 'getUser'
    }
};

service.checkIfModuleActiveForRouter(request, {}).then(() => {
    return service.validateRouterConfiguration(request, {});
}).then(() => {
    assert.strictEqual(request.model.groupName, 'runtime');
    return service.validateRouterConfiguration({
        model: {
            moduleName: 'profile',
            code: 'invalidRoute',
            method: 'GET',
            controller: 'RuntimeUserController'
        }
    }, {}).then(() => {
        throw new Error('Expected invalid router configuration to be rejected');
    }).catch(error => {
        assert.strictEqual(error.code, 'ERR_RTR_00003');
        assert(error.message.includes('key'));
        assert(error.message.includes('operation'));
    });
}).then(() => {
    return service.checkIfModuleActiveForRouter({
        model: {
            moduleName: 'inactiveModule'
        }
    }, {}).then(() => {
        throw new Error('Expected inactive router module to be rejected');
    }).catch(error => {
        assert.strictEqual(error.code, 'ERR_SYS_00001');
    });
}).then(() => {
    console.log('Router configuration governance validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
