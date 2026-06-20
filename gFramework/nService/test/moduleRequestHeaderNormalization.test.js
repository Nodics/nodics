const assert = require('assert');

global.CONFIG = {
    get: key => key === 'defaultContentType' ? 'application/json' : undefined
};
global.SERVICE = {
    DefaultRouterService: {
        prepareUrl: options => 'http://localhost/' + options.moduleName
    }
};
global.UTILS = {
    isBlank: value => value === null || value === undefined || value === ''
};

const moduleService = require('../src/service/module/defaultModuleService');
const service = Object.assign({}, moduleService, {
    LOG: {
        debug: function () {}
    }
});

let legacyRequest = service.buildRequest({
    moduleName: 'profile',
    apiName: '/employee/authenticate',
    header: {
        apiKey: 'legacy-key',
        entCode: 'default',
        authToken: 'legacy-token',
        loginId: 'admin'
    }
});
assert.strictEqual(legacyRequest.headers['x-api-key'], 'legacy-key');
assert.strictEqual(legacyRequest.headers['x-enterprise-code'], 'default');
assert.strictEqual(legacyRequest.headers.Authorization, 'Bearer legacy-token');
assert.strictEqual(legacyRequest.headers.loginId, 'admin');
assert.strictEqual(legacyRequest.headers.apiKey, undefined);
assert.strictEqual(legacyRequest.headers.entCode, undefined);
assert.strictEqual(legacyRequest.headers.authToken, undefined);
assert.strictEqual(legacyRequest.uri, 'http://localhost/profile/v0/employee/authenticate');

let modernRequest = service.buildRequest({
    moduleName: 'profile',
    apiName: '/employee/authenticate',
    header: {
        'x-api-key': 'modern-key',
        'x-enterprise-code': 'default',
        Authorization: 'Bearer modern-token'
    }
});
assert.strictEqual(modernRequest.headers['x-api-key'], 'modern-key');
assert.strictEqual(modernRequest.headers['x-enterprise-code'], 'default');
assert.strictEqual(modernRequest.headers.Authorization, 'Bearer modern-token');

let normalizedPathRequest = service.buildRequest({
    moduleName: 'profile',
    apiName: 'ping'
});
assert.strictEqual(normalizedPathRequest.uri, 'http://localhost/profile/v0/ping', 'Module paths must normalize a missing leading slash');

let externalRequest = service.buildExternalRequest({
    uri: 'https://example.test/resource',
    header: {
        apiKey: 'external-key'
    },
    params: {
        page: 1
    }
});
assert.strictEqual(externalRequest.headers['x-api-key'], 'external-key');
assert.strictEqual(externalRequest.headers.apiKey, undefined);
assert.strictEqual(externalRequest.uri, 'https://example.test/resource?page=1');
