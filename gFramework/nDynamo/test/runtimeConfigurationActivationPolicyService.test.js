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

let preview = {
    destructive: true,
    warnings: ['route method will change'],
    changedPaths: ['method']
};

global.SERVICE = {
    DefaultIdentityGovernanceService: { getSystemAuthData: function () { return { isSystem: true }; } },
    DefaultConfigurationActivationRequestService: {
        get: function () {
            return Promise.resolve({ result: [{
                code: 'approved-request', configurationType: 'routerConfiguration', configurationCode: 'runtimeUser',
                requestedBy: 'requester', approvedBy: 'change-manager', approvalReason: 'Approved change ticket',
                approvalStatus: 'APPROVED', status: 'APPROVED'
            }] });
        }
    },
    DefaultRuntimeConfigurationPreviewService: {
        previewActivation: function () {
            return Promise.resolve({
                data: preview
            });
        }
    }
};

const service = require('../src/service/audit/defaultRuntimeConfigurationActivationPolicyService');

service.evaluateActivation({
    tenant: 'default',
    authData: {
        code: 'admin'
    }
}, {
    configurationType: 'routerConfiguration',
    configurationCode: 'runtimeUser'
}).then(() => {
    throw new Error('Destructive activation without approval should fail');
}).catch(error => {
    assert.strictEqual(error.code, 'ERR_SYS_00002');
    assert.strictEqual(error.approvalStatus, 'REQUIRED');
    assert.strictEqual(error.riskLevel, 'HIGH');
    assert.deepStrictEqual(error.warnings, ['route method will change']);

    return service.evaluateActivation({
        tenant: 'default',
        authData: {
            code: 'admin'
        },
        activationApproval: {
            approved: true,
            approvedBy: 'change-manager',
            approvalReason: 'Approved change ticket'
        }
    }, {
        configurationType: 'routerConfiguration',
        configurationCode: 'runtimeUser'
    });
}).then(() => {
    throw new Error('Caller-supplied approval metadata must not authorize activation');
}).catch(error => {
    assert.strictEqual(error.code, 'ERR_SYS_00002');
    return service.evaluateActivation({
        tenant: 'default',
        authData: { code: 'operator' },
        runtimeActivationSource: 'approvedRequest',
        trustedRuntimeActivation: true,
        activationRequestCode: 'approved-request',
        activationApproval: { approved: true, approvedBy: 'spoofed-approver', activationRequestCode: 'approved-request' }
    }, {
        configurationType: 'routerConfiguration',
        configurationCode: 'runtimeUser'
    });
}).then(decision => {
    assert.strictEqual(decision.approvalStatus, 'APPROVED');
    assert.strictEqual(decision.riskLevel, 'HIGH');
    assert.strictEqual(decision.approvedBy, 'change-manager');
    assert.strictEqual(decision.approvalReason, 'Approved change ticket');

    preview = {
        destructive: false,
        warnings: [],
        changedPaths: ['description']
    };
    return service.evaluateActivation({
        tenant: 'default',
        authData: {
            code: 'admin'
        }
    }, {
        configurationType: 'schemaConfiguration',
        configurationCode: 'tenant'
    });
}).then(decision => {
    assert.strictEqual(decision.approvalStatus, 'NOT_REQUIRED');
    assert.strictEqual(decision.riskLevel, 'LOW');
    assert.strictEqual(decision.approved, true);
    console.log('Runtime configuration activation policy service validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
