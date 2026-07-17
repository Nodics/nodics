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

const oldDate = '2025-01-01T00:00:00.000Z';
const activationRequests = [
    {
        code: 'activationRequest_pending',
        configurationType: 'routerConfiguration',
        configurationCode: 'userRoute',
        moduleName: 'profile',
        approvalStatus: 'PENDING',
        status: 'REQUESTED',
        riskLevel: 'LOW',
        creationTime: oldDate
    },
    {
        code: 'activationRequest_highRisk',
        configurationType: 'schemaConfiguration',
        configurationCode: 'tenant',
        moduleName: 'profile',
        approvalStatus: 'APPROVED',
        status: 'ACTIVATED',
        riskLevel: 'HIGH',
        creationTime: oldDate,
        preview: {
            destructive: true
        }
    },
    {
        code: 'activationRequest_rejected',
        configurationType: 'routerConfiguration',
        configurationCode: 'orderRoute',
        moduleName: 'order',
        approvalStatus: 'REJECTED',
        status: 'REJECTED',
        riskLevel: 'LOW',
        creationTime: oldDate
    }
];

const activationLogs = [
    {
        code: 'activationLog_success',
        configurationType: 'routerConfiguration',
        configurationCode: 'orderRoute',
        moduleName: 'order',
        action: 'activate',
        status: 'SUCCESS',
        riskLevel: 'LOW',
        creationTime: oldDate
    },
    {
        code: 'activationLog_highRisk',
        configurationType: 'schemaConfiguration',
        configurationCode: 'tenant',
        moduleName: 'profile',
        action: 'activate',
        status: 'FAILED',
        riskLevel: 'HIGH',
        creationTime: oldDate
    }
];

let requestRemovePayload;
let logRemovePayload;
let auditEntry;
global.SERVICE = {
    DefaultConfigurationActivationRequestService: {
        get: function () {
            return Promise.resolve({
                result: activationRequests
            });
        },
        remove: function (request) {
            requestRemovePayload = request;
            return Promise.resolve({
                removed: request.codes.length
            });
        }
    },
    DefaultConfigurationActivationLogService: {
        get: function () {
            return Promise.resolve({
                result: activationLogs
            });
        },
        remove: function (request) {
            logRemovePayload = request;
            return Promise.resolve({
                removed: request.codes.length
            });
        }
    },
    DefaultRuntimeConfigurationAuditService: {
        recordActivation: function (entry) {
            auditEntry = entry;
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

const service = require('../src/service/audit/defaultRuntimeConfigurationGovernanceCleanupService');

service.previewCleanup({
    tenant: 'default',
    httpRequest: {
        body: {
            olderThanDays: 1
        }
    }
}).then(preview => {
    assert.strictEqual(preview.code, 'SUC_SYS_00000');
    assert.strictEqual(preview.metadata.dryRun, true);
    assert.strictEqual(preview.data.activationRequests.loaded, 3);
    assert.strictEqual(preview.data.activationRequests.eligible.length, 1);
    assert.strictEqual(preview.data.activationRequests.eligible[0].code, 'activationRequest_rejected');
    assert.strictEqual(preview.data.activationRequests.skipped.length, 2);
    assert(preview.data.activationRequests.skipped.some(record => record.skipReason === 'PENDING_REQUEST_PROTECTED'));
    assert(preview.data.activationRequests.skipped.some(record => record.skipReason === 'HIGH_RISK_PROTECTED'));
    assert.strictEqual(preview.data.activationLogs.eligible.length, 1);
    assert.strictEqual(preview.data.activationLogs.skipped.length, 1);
    assert.strictEqual(requestRemovePayload, undefined);
    assert.strictEqual(logRemovePayload, undefined);

    return service.cleanup({
        tenant: 'default',
        httpRequest: {
            body: {
                olderThanDays: 1
            }
        }
    });
}).then(unconfirmed => {
    assert.strictEqual(unconfirmed.metadata.requiresConfirmation, true);
    assert.strictEqual(requestRemovePayload, undefined);
    assert.strictEqual(logRemovePayload, undefined);

    return service.cleanup({
        tenant: 'default',
        authData: {
            code: 'admin'
        },
        correlationId: 'cleanup-correlation',
        httpRequest: {
            body: {
                olderThanDays: 1,
                dryRun: false,
                confirmCleanup: true
            }
        }
    });
}).then(cleanup => {
    assert.strictEqual(cleanup.code, 'SUC_SYS_00000');
    assert.strictEqual(cleanup.metadata.dryRun, false);
    assert.deepStrictEqual(requestRemovePayload.codes, ['activationRequest_rejected']);
    assert.deepStrictEqual(logRemovePayload.codes, ['activationLog_success']);
    assert.strictEqual(cleanup.data.result.activationRequests.removed, 1);
    assert.strictEqual(cleanup.data.result.activationLogs.removed, 1);
    assert.strictEqual(auditEntry.configurationType, 'runtimeGovernanceCleanup');
    assert.strictEqual(auditEntry.action, 'cleanup');
    assert.strictEqual(auditEntry.status, 'SUCCESS');
    assert.strictEqual(auditEntry.requestedBy, 'admin');
    assert.strictEqual(auditEntry.correlationId, 'cleanup-correlation');
    console.log('Runtime configuration governance cleanup service validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
