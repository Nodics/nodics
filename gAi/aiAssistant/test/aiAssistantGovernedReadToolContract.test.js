/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/test/AiAssistantGovernedReadToolContract
 * @description Verifies policy, catalogue, permission, transport, path, method, and result bounds for read-only Assistant tools.
 * @layer test
 * @owner aiAssistant
 */
const assert = require('assert');
const defaults = require('../config/properties').aiAssistant;
const service = require('../src/service/tool/defaultAiAssistantToolExecutionService');
assert.strictEqual(defaults.tools.catalogueApiName, '/bootstrap',
    'Assistant discovery must reuse the authoritative employee BackOffice bootstrap route');
const configuration = JSON.parse(JSON.stringify(defaults));
configuration.enabled = true;
configuration.tools.enabled = true;
const policy = {
    contractVersion: 1,
    enabled: true,
    approvedOperations: [{
        toolId: 'profile.employee.read',
        ownerModule: 'profile',
        operationId: 'profile_employee_get',
        mode: 'READ',
        requiredPermissions: ['profile.employee.read'],
        resultFields: ['employee']
    }]
};
const operation = {
    operationId: 'profile_employee_get',
    path: '/nodics/profile/v0/employees/{employeeCode}',
    method: 'GET',
    permissions: ['profile.employee.read']
};
const request = {
    tenant: 'default',
    authToken: 'employee-token',
    authData: {
        entCode: 'default',
        permissions: ['profile.employee.read']
    }
};
const plan = {
    contractVersion: 1,
    toolId: 'profile.employee.read',
    ownerModule: 'profile',
    operationId: 'profile_employee_get',
    arguments: {
        pathParameters: { employeeCode: 'employee/one' },
        queryParameters: { fields: 'code,name', active: true }
    }
};
let captured;
global.SERVICE = {
    DefaultModuleService: {
        buildRequest: options => {
            captured = options;
            return options;
        },
        fetch: descriptor => Promise.resolve({
            data: { data: { employee: { code: 'employee-one', name: 'One' } } },
            descriptor: descriptor
        })
    }
};
const runtime = {
    configuration: configuration,
    backofficeCatalogueProvider: () => Promise.resolve({
        catalogue: {
            profile: {
                contract: { operations: [operation] }
            }
        }
    })
};

async function run() {
    const result = await service.execute(plan, policy, request, runtime);
    assert.strictEqual(captured.moduleName, 'profile');
    assert.strictEqual(captured.methodName, 'GET');
    assert.strictEqual(captured.apiVersion, 'v0');
    assert.strictEqual(captured.apiName,
        '/employees/employee%2Fone?active=true&fields=code%2Cname');
    assert.strictEqual(captured.header.Authorization, 'employee-token');
    assert.strictEqual(captured.header['x-enterprise-code'], 'default');
    assert.deepStrictEqual(result.result, {
        employee: { code: 'employee-one', name: 'One' }
    });
    const eventTypes = [];
    runtime.toolEventPublisher = (turn, eventType, data) => {
        eventTypes.push({ eventType: eventType, data: data });
        return Promise.resolve();
    };
    await service.executeAndRecord(plan, policy, { turnCode: 'turn-one' },
        request, runtime, {});
    assert.deepStrictEqual(eventTypes.map(event => event.eventType),
        ['TOOL_PLAN', 'TOOL_STARTED', 'TOOL_RESULT']);
    assert.strictEqual(JSON.stringify(eventTypes).includes('employee-one'), false,
        'Tool event evidence must not persist target data');

    await assert.rejects(service.execute(Object.assign({}, plan, {
        toolId: 'profile.employee.delete'
    }), policy, request, runtime), /AI_ASSISTANT_TOOL_NOT_APPROVED/);

    await assert.rejects(service.execute(plan, policy, Object.assign({}, request, {
        authData: { entCode: 'default', permissions: [] }
    }), runtime), /AI_ASSISTANT_TOOL_PERMISSION_DENIED/);

    operation.method = 'DELETE';
    await assert.rejects(service.execute(plan, policy, request, runtime),
        /AI_ASSISTANT_READ_ONLY_TOOL_REQUIRED/);
    operation.method = 'GET';

    operation.path = 'https://attacker.invalid/employees/{employeeCode}';
    await assert.rejects(service.execute(plan, policy, request, runtime),
        /AI_ASSISTANT_TOOL_PATH_INVALID/);
    operation.path = '/nodics/profile/v0/employees/{employeeCode}';

    await assert.rejects(service.execute(Object.assign({}, plan, {
        path: '/arbitrary',
        arguments: { pathParameters: { employeeCode: 'one' } }
    }), policy, request, runtime), /AI_ASSISTANT_TOOL_PLAN_INVALID/);

    configuration.tools.maximumResultCharacters = 4;
    await assert.rejects(service.execute(plan, policy, request, runtime),
        /AI_ASSISTANT_TOOL_RESULT_TOO_LARGE/);
    console.log('AI Assistant governed read-only tool contract validated');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
