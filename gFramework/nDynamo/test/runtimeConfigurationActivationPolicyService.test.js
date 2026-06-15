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
