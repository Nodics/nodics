/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/test/EnterpriseManagementSearchContract
 * @description Verifies the bounded, human-only, projected Profile enterprise-search contract and Assistant allowlist identity.
 * @layer test
 * @owner profile
 */
const assert = require('assert');
const properties = require('../config/properties');
const routes = require('../src/router/routers').profile.loadDefaults;
const policyData = require('../../../gAi/aiAssistant/data/init/data/assistant/defaultAssistantToolPolicyData');
const localPolicyData = require('../../../startio/envs/startioLocal/monoServer/data/init/data/assistant/startioLocalAssistantToolPolicyData');

global.CONFIG = {
    get: key => key === 'enterpriseManagement' ? properties.enterpriseManagement :
        key === 'defaultTenant' ? 'default' : undefined
};
global.SERVICE = {
    DefaultStatusService: {
        get: () => ({ code: 400, message: 'Invalid request parameters' })
    }
};
global.UTILS = {
    extractFromMessage: (message, code) => ({ code: code, responseCode: 400, message: message }),
    extractFromError: (error, message, code) => ({
        code: code, responseCode: 400, message: message || error.message, stack: error.stack
    })
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message);
            this.code = code;
            this.name = 'NodicsError';
        }
    }
};

const service = require('../src/service/enterprise/defaultEnterpriseManagementService');
const controller = require('../src/controller/enterprise/defaultEnterpriseManagementController');

async function run() {
    const route = routes.searchEnterprises;
    assert.strictEqual(route.method, 'GET');
    assert.strictEqual(route.secured, true);
    assert.deepStrictEqual(route.authTokenTypes, ['access']);
    assert.strictEqual(route.permission, 'profile.enterprise.search');
    assert.strictEqual(route.operation, 'search');
    assert.strictEqual(routes.createEnterprise.method, 'POST');
    assert.strictEqual(routes.createEnterprise.permission, 'profile.enterprise.create');
    assert.strictEqual(routes.createEnterprise.requestBody.content['application/json'].schema.additionalProperties, false);
    assert(service.create.toString().includes('DefaultEnterpriseService.save'));

    let mappedRequest;
    global.FACADE = {
        DefaultEnterpriseManagementFacade: {
            search: request => {
                mappedRequest = request;
                return Promise.resolve({ items: [] });
            }
        }
    };
    await controller.search({
        query: { code: 'stale' },
        httpRequest: { query: { code: 'default', limit: '10' } }
    });
    assert.deepStrictEqual(mappedRequest.query, { code: 'default', limit: '10' },
        'Controller must map HTTP query parameters into the service request');

    let captured;
    global.SERVICE.DefaultEnterpriseService = {
        get: request => {
            captured = request;
            return Promise.resolve({
                result: [{
                    code: 'acme',
                    name: 'Acme',
                    active: true,
                    tenant: { code: 'acmeTenant', secret: 'hidden' },
                    superEnterprise: { code: 'global' },
                    contacts: [{ value: 'private@example.test' }],
                    addresses: [{ city: 'Private' }],
                    apiKey: 'never-project'
                }]
            });
        }
    };
    const request = {
        tenant: 'callerTenant',
        authData: {
            tokenType: 'access',
            principalId: 'admin',
            permissions: ['profile.enterprise.search']
        },
        query: { code: 'acme', active: 'true', page: '2', limit: '10' }
    };
    const result = await service.search(request);
    assert.strictEqual(captured.tenant, 'default',
        'Enterprise persistence remains in the configured Profile authority tenant');
    assert.strictEqual(captured.authData, request.authData);
    assert.deepStrictEqual(captured.query, { code: 'acme', active: true });
    assert.deepStrictEqual(captured.options, { recursive: false });
    assert.deepStrictEqual(captured.searchOptions, {
        pageSize: 10, pageNumber: 2, sort: { code: 1 }
    });
    assert.deepStrictEqual(result, {
        page: 2,
        limit: 10,
        count: 1,
        items: [{
            code: 'acme',
            name: 'Acme',
            active: true,
            tenantCode: 'acmeTenant',
            superEnterpriseCode: 'global'
        }]
    });
    assert.strictEqual(JSON.stringify(result).includes('private@example.test'), false);
    assert.strictEqual(JSON.stringify(result).includes('never-project'), false);

    await assert.rejects(service.search({
        authData: { tokenType: 'service', principalId: 'apiAdmin' },
        query: {}
    }), error => error.code === 'ERR_PRFL_00003');
    await assert.rejects(service.search({
        authData: { tokenType: 'access', principalId: 'admin' },
        query: { $where: 'unsafe' }
    }), error => error.code === 'ERR_PRFL_00003');
    await assert.rejects(service.search({
        authData: { tokenType: 'access', principalId: 'admin' },
        query: { code: { $ne: null } }
    }), error => error.code === 'ERR_PRFL_00003');
    await assert.rejects(service.search({
        authData: { tokenType: 'access', principalId: 'admin' },
        query: { limit: properties.enterpriseManagement.search.maximumResultCount + 1 }
    }), error => error.code === 'ERR_PRFL_00003');

    let createQueries = [];
    let savedRequest;
    global.SERVICE.DefaultEnterpriseService = {
        get: request => {
            createQueries.push(request);
            return Promise.resolve({
                result: request.query.tenant === 'assignedTenant' ? [{ code: 'owner' }] : []
            });
        },
        save: request => {
            savedRequest = request;
            return Promise.resolve({ result: request.model });
        }
    };
    const createRequest = {
        authData: { tokenType: 'access', principalId: 'admin' },
        body: { code: 'acme-new', name: 'Acme New', tenantCode: 'availableTenant' }
    };
    const created = await service.create(createRequest);
    assert.deepStrictEqual(createQueries.map(item => item.query), [
        { code: 'acme-new' }, { tenant: 'availableTenant' }
    ]);
    assert.strictEqual(savedRequest.tenant, 'default');
    assert.deepStrictEqual(savedRequest.model, {
        code: 'acme-new', name: 'Acme New', tenant: 'availableTenant', active: true
    });
    assert.deepStrictEqual(created, {
        code: 'acme-new', name: 'Acme New', tenantCode: 'availableTenant', active: true
    });
    await assert.rejects(service.create({
        authData: { tokenType: 'access', principalId: 'admin' },
        body: { code: 'second-owner', name: 'Second Owner', tenantCode: 'assignedTenant' }
    }), error => error.code === 'ERR_PRFL_00003' &&
        error.message === 'Enterprise tenant is already assigned');

    const assertPolicy = policy => {
        const tool = policy.record0.approvedOperations.find(item =>
            item.toolId === 'profile.enterprise.search');
        assert(tool, 'Enterprise search must be explicitly allowlisted');
        assert.strictEqual(tool.ownerModule, 'profile');
        assert.strictEqual(tool.operationId, 'profile_searchenterprises');
        assert.deepStrictEqual(tool.requiredPermissions, ['profile.enterprise.search']);
        assert.deepStrictEqual(tool.resultFields, ['page', 'limit', 'count', 'items']);
        assert.strictEqual(tool.inputSchema.properties.queryParameters.additionalProperties, false);
        const mutation = policy.record0.approvedOperations.find(item =>
            item.toolId === 'profile.enterprise.create');
        assert(mutation, 'Enterprise creation must be explicitly allowlisted');
        assert.strictEqual(mutation.ownerModule, 'profile');
        assert.strictEqual(mutation.operationId, 'profile_createenterprise');
        assert.strictEqual(mutation.mode, 'MUTATION');
        assert.strictEqual(mutation.confirmationRequired, true);
        assert.deepStrictEqual(mutation.requiredPermissions, ['profile.enterprise.create']);
        assert.deepStrictEqual(mutation.inputSchema.required, ['code', 'name']);
        assert.strictEqual(mutation.inputSchema.additionalProperties, false);
    };
    assertPolicy(policyData);
    assertPolicy(localPolicyData);
    assert.strictEqual(policyData.record0.enabled, false);
    assert.strictEqual(localPolicyData.record0.enabled, true);

    console.log('Profile enterprise management search contract validated');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
