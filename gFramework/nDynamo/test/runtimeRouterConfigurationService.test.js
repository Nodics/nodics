/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.CONFIG = {
    get: function () {
        return 'default';
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

let rawRouters = {
    profile: {
        users: {
            getUser: {
                key: '/users/:id',
                method: 'GET',
                controller: 'DefaultUserController',
                operation: 'getUser'
            }
        }
    }
};
let registeredRouters;

global.SERVICE = {
    DefaultFilesLoaderService: {
        mergeRuntimeRouterFiles: function (frameworkFile, runtimeFile) {
            return Object.assign({}, frameworkFile, runtimeFile);
        }
    },
    DefaultRouterConfigurationService: {
        getRawRouters: function () {
            return rawRouters;
        },
        setRawRouters: function (routers) {
            rawRouters = routers;
        }
    },
    DefaultRouterService: {
        registerRouter: function (routers) {
            registeredRouters = routers;
            return Promise.resolve(true);
        }
    }
};

const service = require('../src/service/router/defaultRouterConfigurationService');
service.LOG = {
    warn: function () {},
    error: function () {}
};
service.get = function () {
    return Promise.resolve({
        result: [{
            moduleName: 'profile',
            groupName: 'users',
            code: 'runtimeUser',
            key: '/runtime/users/:id',
            method: 'GET',
            controller: 'RuntimeUserController',
            operation: 'getUser'
        }, {
            moduleName: 'catalog',
            code: 'runtimeProduct',
            key: '/runtime/products/:id',
            method: 'GET',
            controller: 'RuntimeProductController',
            operation: 'getProduct'
        }]
    });
};

service.prepareRuntimeRouterRegistry([{
    moduleName: 'profile',
    groupName: 'users',
    code: 'runtimeUser'
}, {
    moduleName: 'catalog',
    code: 'runtimeProduct'
}]);

service.registerRoutersFromDatabase({ tenant: 'default' }).then(success => {
    assert.strictEqual(success.count, 2);
    assert.strictEqual(rawRouters.profile.users.runtimeUser.controller, 'RuntimeUserController');
    assert.strictEqual(rawRouters.catalog.runtime.runtimeProduct.controller, 'RuntimeProductController');
    assert.strictEqual(registeredRouters.profile.users.runtimeUser.key, '/runtime/users/:id');
    assert.strictEqual(registeredRouters.catalog.runtime.runtimeProduct.key, '/runtime/products/:id');
    console.log('Runtime router configuration service validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
