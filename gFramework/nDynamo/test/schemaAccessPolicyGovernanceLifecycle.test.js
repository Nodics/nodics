/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.CONFIG = {
    get: function (key) {
        if (key === 'identityGovernance') {
            return {
                separationOfDuties: {
                    requireActor: true
                }
            };
        }
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

let policies = {
    productCostPolicy: {
        code: 'productCostPolicy',
        moduleName: 'catalog',
        schemaName: 'product',
        propertyName: 'cost',
        actions: ['read'],
        effect: 'MASK',
        priority: 50,
        status: 'ACTIVE'
    }
};
let storedRequests = {};
let auditEntries = [];

global.SERVICE = {
    DefaultSchemaAccessPolicyContractService: require('../src/service/access/defaultSchemaAccessPolicyContractService'),
    DefaultRuntimeConfigurationPreviewService: require('../src/service/audit/defaultRuntimeConfigurationPreviewService'),
    DefaultRuntimeConfigurationAuditService: {
        recordActivation: function (entry) {
            auditEntries.push(entry);
            return Promise.resolve({
                result: [entry]
            });
        },
        resolveRequestedBy: function (request) {
            return request.authData && request.authData.code;
        },
        resolveCorrelationId: function (request) {
            return request.correlationId;
        }
    },
    DefaultConfigurationActivationRequestService: {
        save: function (request) {
            storedRequests[request.model.code] = request.model;
            return Promise.resolve({
                result: [request.model]
            });
        },
        get: function (request) {
            return Promise.resolve({
                result: storedRequests[request.query.code] ? [storedRequests[request.query.code]] : []
            });
        }
    },
    DefaultConfigurationActivationLogService: {
        get: function (request) {
            return Promise.resolve({
                result: auditEntries.filter(entry => entry.code === request.query.code)
            });
        }
    },
    DefaultSchemaAccessPolicyService: {
        get: function (request) {
            return Promise.resolve({
                result: policies[request.query.code] ? [policies[request.query.code]] : []
            });
        },
        save: function (request) {
            policies[request.model.code] = request.model;
            return Promise.resolve({
                result: [request.model]
            });
        }
    }
};

const activationRequestService = require('../src/service/audit/defaultRuntimeConfigurationActivationRequestService');
const rollbackService = require('../src/service/audit/defaultRuntimeConfigurationRollbackService');

let proposedPolicy = {
    code: 'productCostPolicy',
    moduleName: 'catalog',
    schemaName: 'product',
    propertyName: 'cost',
    actions: ['read', 'export'],
    effect: 'HIDE',
    priority: 10,
    status: 'ACTIVE',
    reason: 'Hide cost from catalog viewers'
};

activationRequestService.createActivationRequest({
    tenant: 'default',
    authData: {
        code: 'requester'
    },
    correlationId: 'schema-access-request',
    activationRequest: {
        code: 'schemaAccessPolicyRequest1',
        configurationType: 'schemaAccessPolicy',
        configurationCode: 'productCostPolicy',
        moduleName: 'catalog',
        configuration: proposedPolicy,
        requestReason: 'Govern product cost visibility'
    }
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(success.data.approvalStatus, 'PENDING');
    assert.strictEqual(success.data.riskLevel, 'HIGH');
    assert.strictEqual(success.data.preview.configurationType, 'schemaAccessPolicy');
    assert.strictEqual(success.data.preview.previousSnapshot.effect, 'MASK');
    assert.strictEqual(success.data.preview.nextSnapshot.effect, 'HIDE');
    assert(success.data.preview.changedPaths.includes('effect'));
    assert(success.data.preview.warnings.includes('schema access policy effect will change'));
    assert.strictEqual(success.data.configuration.effect, 'HIDE');
    assert(success.data.configurationDigest);

    return activationRequestService.approveActivationRequest({
        tenant: 'default',
        authData: {
            code: 'approver'
        },
        activationRequest: {
            activationRequestCode: 'schemaAccessPolicyRequest1',
            approvalReason: 'Approved by data governance'
        }
    });
}).then(success => {
    assert.strictEqual(success.data.approvalStatus, 'APPROVED');
    assert.strictEqual(success.data.approvedBy, 'approver');

    return activationRequestService.activateApprovedRequest({
        tenant: 'default',
        authData: {
            code: 'operator'
        },
        activationRequest: {
            activationRequestCode: 'schemaAccessPolicyRequest1'
        }
    });
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(policies.productCostPolicy.effect, 'HIDE');
    assert.strictEqual(auditEntries.length, 1);
    assert.strictEqual(auditEntries[0].configurationType, 'schemaAccessPolicy');
    assert.strictEqual(auditEntries[0].action, 'activate');
    assert.strictEqual(auditEntries[0].status, 'SUCCESS');
    assert.strictEqual(auditEntries[0].previousSnapshot.effect, 'MASK');
    assert.strictEqual(auditEntries[0].nextSnapshot.effect, 'HIDE');
    auditEntries[0].code = 'schemaAccessPolicyAudit1';

    return rollbackService.rollbackActivation({
        tenant: 'default',
        activationCode: 'schemaAccessPolicyAudit1',
        authData: {
            code: 'rollbackOperator'
        },
        correlationId: 'schema-access-rollback'
    });
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(policies.productCostPolicy.effect, 'MASK');
    assert.strictEqual(auditEntries.length, 2);
    assert.strictEqual(auditEntries[1].action, 'rollback');
    assert.strictEqual(auditEntries[1].status, 'SUCCESS');
    assert.strictEqual(auditEntries[1].previousSnapshot.effect, 'HIDE');
    assert.strictEqual(auditEntries[1].nextSnapshot.effect, 'MASK');
    console.log('Schema access policy governance lifecycle validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
