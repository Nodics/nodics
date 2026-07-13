/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module nRouter/test/openapiContractGeneration
 * @description Verifies that OpenAPI generation follows effective layered schema and router definitions, excludes inactive capabilities, preserves security metadata, rejects conflicting routes and invalid references, and emits accurate request and response contracts.
 * @layer test
 * @owner nRouter
 * @override Project modules may add focused fixtures for their layered router parameters, request bodies, responses, and schema metadata without changing this framework contract test.
 */

global.CONFIG = {
    get: function (name) {
        if (name === 'server') return { options: { contextRoot: 'nodics' } };
        if (name === 'cache') return { routerLevelCache: {} };
        return undefined;
    }
};

global.UTILS = {
    isRouterEnabled: function () { return true; }
};

const modules = {
    sample: {
        metaData: { prefix: 'sample' },
        rawSchema: {
            item: {
                model: true,
                service: { enabled: true },
                router: { enabled: true },
                definition: {
                    code: { type: 'string', required: true, minLength: 2, example: 'ITEM-1' },
                    active: { type: 'bool', default: true },
                    tags: { type: 'array', items: { type: 'string' } }
                }
            },
            disabled: {
                model: true,
                service: { enabled: true },
                router: { enabled: false },
                definition: { code: { type: 'string' } }
            }
        }
    }
};

global.NODICS = {
    getModules: function () { return modules; },
    getServerName: function () { return 'sampleServer'; },
    getServerRootName: function () { return 'sampleServer'; },
    getEnvironmentName: function () { return 'sampleEnvironment'; },
    getNodeName: function () { return undefined; },
    getActiveModules: function () { return ['sample']; }
};

const generator = require('../src/tooling/generateOpenapiContract');
const authProperties = require('../../nAuth/config/properties');
assert(authProperties.identityGovernance.permissionCatalog.includes('system.contract.openapi.view'));

const defaultRoutes = {
    default: {
        read: {
            getById: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/id/:id',
                method: 'GET',
                controller: 'DefaultctrlName',
                operation: 'get'
            }
        },
        write: {
            save: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName',
                method: 'PUT',
                controller: 'DefaultctrlName',
                operation: 'save'
            },
            saveAll: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/schemaName/all',
                method: 'PUT',
                controller: 'DefaultctrlName',
                operation: 'saveAll'
            }
        }
    },
    common: {},
    sample: {
        contracts: {
            contract: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'sample.contract.view',
                permissionConfig: 'sample.contract.routePermission',
                key: '/contract',
                method: 'POST',
                controller: 'DefaultContractController',
                operation: 'createContract',
                parameters: {
                    dryRun: { in: 'query', schema: { type: 'boolean' } }
                },
                help: { body: { name: 'Contract name', enabled: true } }
            },
            inactive: {
                secured: true,
                active: false,
                accessGroups: ['userGroup'],
                key: '/inactive',
                method: 'GET',
                controller: 'DefaultContractController',
                operation: 'inactive'
            }
        }
    }
};

const document = generator.createDocument({
    rawRouters: defaultRoutes,
    rawSchema: { sample: modules.sample.rawSchema },
    options: { includeRuntimeSchemas: false },
    warnings: []
});

assert.strictEqual(generator.validateDocument(document), true);
assert.strictEqual(document.servers[0].url, '/');
assert(document.paths['/nodics/sample/v0/item/id/{id}'].get);
assert(!document.paths['/nodics/sample/v0/disabled']);
assert(!document.paths['/nodics/sample/v0/inactive']);
assert.strictEqual(document.components.schemas.sample_item.required[0], 'code');
assert.strictEqual(document.components.schemas.sample_item.properties.tags.items.type, 'string');
assert.strictEqual(document.components.schemas.sample_item.properties.code.minLength, 2);
assert.strictEqual(document.paths['/nodics/sample/v0/item'].put.requestBody.content['application/json'].schema.$ref, '#/components/schemas/sample_item');
assert.strictEqual(document.paths['/nodics/sample/v0/item/all'].put.requestBody.content['application/json'].schema.type, 'array');

const configured = document.paths['/nodics/sample/v0/contract'].post;
assert(configured.parameters.some(parameter => parameter.name === 'dryRun' && parameter.in === 'query'));
assert.strictEqual(configured['x-nodics'].permission, 'sample.contract.view');
assert.strictEqual(configured['x-nodics'].permissionConfig, 'sample.contract.routePermission');
assert.strictEqual(configured.requestBody.content['application/json'].schema.properties.enabled.type, 'boolean');
assert(configured.responses.default.$ref);

const bodyless = generator.createOperation({
    url: '/sample/:id', method: 'DELETE', routerName: 'bodyless', moduleName: 'sample', active: true
});
assert.strictEqual(bodyless.requestBody, undefined);

assert.throws(() => {
    const paths = {};
    generator.addRoute(paths, { url: '/duplicate', method: 'GET', routerName: 'first', moduleName: 'sample', controller: 'FirstController', 'x-nodics': { controller: 'FirstController' } });
    generator.addRoute(paths, { url: '/duplicate', method: 'GET', routerName: 'second', moduleName: 'sample', controller: 'SecondController', 'x-nodics': { controller: 'SecondController' } });
}, /Duplicate effective route/);

const aliases = {};
generator.addRoute(aliases, { url: '/alias', method: 'GET', routerName: 'first', moduleName: 'sample', controller: 'SharedController', operation: 'shared', 'x-nodics': { moduleName: 'one', controller: 'SharedController', operation: 'shared' } });
generator.addRoute(aliases, { url: '/alias', method: 'GET', routerName: 'second', moduleName: 'sample', controller: 'SharedController', operation: 'shared', 'x-nodics': { moduleName: 'two', controller: 'SharedController', operation: 'shared' } });
assert.strictEqual(aliases['/alias'].get['x-nodics'].duplicateDeclarations.length, 1);

assert.throws(() => generator.validateDocument({
    openapi: '3.0.3',
    info: { title: 'Invalid', version: '1' },
    paths: {
        '/one': { get: { operationId: 'same', responses: { 200: { description: 'ok' } } } },
        '/two': { get: { operationId: 'same', responses: { 200: { description: 'ok' } } } }
    }
}), /Duplicate operationId/);

assert.throws(() => generator.validateDocument({
    openapi: '3.0.3',
    info: { title: 'Invalid reference', version: '1' },
    paths: { '/one': { get: { operationId: 'one', responses: { 200: { '$ref': '#/components/responses/Missing' } } } } },
    components: { responses: {} }
}), /Unresolved local reference/);

console.log('OpenAPI generation contract validated');
