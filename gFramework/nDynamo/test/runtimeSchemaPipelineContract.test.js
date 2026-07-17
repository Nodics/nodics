/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDynamo/test/runtimeSchemaPipelineContract
 * @description Verifies runtime schema activation is pipeline-driven, tenant-aware, policy-checked, and audited for both successful and failed activation attempts.
 * @layer test
 * @owner nDynamo
 * @override Projects may replace schema activation behavior through governed runtime services, but must preserve policy evaluation, pipeline dispatch, tenant context, and audit traceability.
 */

const assert = require('assert');

global.CONFIG = {
    get: function (key) {
        return key === 'defaultTenant' ? 'default' : undefined;
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
    getModule: function (moduleName) {
        return {
            rawSchema: {
                tenant: {
                    code: 'tenant',
                    moduleName,
                    definition: {
                        code: { type: 'string' }
                    }
                },
                address: {
                    code: 'address',
                    moduleName,
                    definition: {
                        code: { type: 'string' }
                    }
                }
            }
        };
    }
};

const runtimeSchemas = {
    tenant: {
        code: 'tenant',
        moduleName: 'profile',
        active: true,
        definition: {
            code: { type: 'string' }
        }
    },
    address: {
        code: 'address',
        moduleName: 'profile',
        active: true,
        definition: {
            code: { type: 'string' }
        }
    },
    inactiveTenant: {
        code: 'inactiveTenant',
        moduleName: 'profile',
        active: false,
        definition: {
            code: { type: 'string' }
        }
    }
};

let policyDescriptors = [];
let pipelineCalls = [];
let auditEntries = [];

global.SERVICE = {
    DefaultRuntimeConfigurationActivationPolicyService: {
        evaluateActivation: function (request, descriptor) {
            policyDescriptors.push({ request, descriptor });
            return Promise.resolve({
                approvalStatus: request.activationRequestCode ? 'APPROVED' : 'NOT_REQUIRED',
                approvedBy: request.activationRequestCode ? 'approver' : undefined,
                approvalReason: request.activationRequestCode ? 'Approved change' : undefined,
                riskLevel: request.activationRequestCode ? 'HIGH' : 'LOW',
                activationRequestCode: request.activationRequestCode,
                preview: {
                    warnings: request.activationRequestCode ? ['schema activation approved'] : []
                }
            });
        }
    },
    DefaultPipelineService: {
        start: function (pipelineName, request, response) {
            pipelineCalls.push({ pipelineName, request, response });
            if (request.schemaCode === 'address' && request.failAddress === true) {
                return Promise.reject(new Error('address activation failed'));
            }
            return Promise.resolve({ pipelineName, schemaCode: request.schemaCode });
        }
    },
    DefaultRuntimeConfigurationAuditService: {
        recordActivation: function (entry) {
            auditEntries.push(entry);
            return Promise.resolve(true);
        },
        resolveRequestedBy: function (request) {
            return request.authData && request.authData.code;
        },
        resolveCorrelationId: function (request) {
            return request.correlationId;
        }
    }
};

const service = require('../src/service/schema/defaultSchemaConfigurationService');
service.get = function (request) {
    return Promise.resolve({
        result: runtimeSchemas[request.query.code] ? [runtimeSchemas[request.query.code]] : []
    });
};

(async function run() {
    const request = {
        tenant: 'default',
        authData: { code: 'admin' },
        correlationId: 'schema-activation',
        activationRequestCode: 'approved-schema-request',
        event: {
            data: {
                models: ['tenant', 'address']
            }
        }
    };

    const result = await service.handleSchemaUpdate(request, ['tenant', 'address']);

    assert.strictEqual(result, 'Updated all schemas');
    assert.deepStrictEqual(policyDescriptors.map(item => item.descriptor.configurationCode), ['tenant', 'address']);
    assert.deepStrictEqual(pipelineCalls.map(item => item.pipelineName), ['schemaUpdatedPipeline', 'schemaUpdatedPipeline']);
    assert.deepStrictEqual(pipelineCalls.map(item => item.request.schemaCode), ['tenant', 'address']);
    assert(pipelineCalls.every(item => item.request.tenant === 'default'));
    assert.strictEqual(request.runtimeActivationPolicyDecisions.tenant.approvalStatus, 'APPROVED');
    assert.strictEqual(request.runtimeActivationPolicyDecisions.address.activationRequestCode, 'approved-schema-request');
    assert.strictEqual(auditEntries.length, 2);
    assert.deepStrictEqual(auditEntries.map(item => item.status), ['SUCCESS', 'SUCCESS']);
    assert(auditEntries.every(item => item.tenant === 'default'));
    assert(auditEntries.every(item => item.requestedBy === 'admin'));
    assert.strictEqual(auditEntries[0].activationRequestCode, 'approved-schema-request');
    assert.strictEqual(auditEntries[0].previousSnapshot.definition.code.type, 'string');
    assert.strictEqual(auditEntries[0].nextSnapshot.code, 'tenant');

    policyDescriptors = [];
    pipelineCalls = [];
    auditEntries = [];
    SERVICE.DefaultPipelineService.start = function (pipelineName, request, response) {
        pipelineCalls.push({ pipelineName, request, response });
        return Promise.reject(new Error('schema activation failed'));
    };

    await assert.rejects(() => service.handleSchemaUpdate({
        tenant: 'default',
        authData: { code: 'admin' },
        correlationId: 'schema-failure',
        event: { data: { models: ['tenant'] } }
    }, ['tenant']), /schema activation failed/);
    assert.strictEqual(auditEntries.length, 1);
    assert.strictEqual(auditEntries[0].status, 'FAILED');
    assert.strictEqual(auditEntries[0].configurationType, 'schemaConfiguration');
    assert.strictEqual(auditEntries[0].configurationCode, 'tenant');
    assert(auditEntries[0].error);

    console.log('Runtime schema pipeline contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
