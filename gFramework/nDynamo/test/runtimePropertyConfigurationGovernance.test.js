/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module dynamo/test/RuntimePropertyConfigurationGovernance
 * @description Proves tenant properties use the shared preview, approval,
 * integrity, audit, activation, and rollback lifecycle.
 * @layer test
 * @owner dynamo
 */
const assert = require('assert');
const _ = require('lodash');

class NodicsError extends Error {
    constructor(code, message) {
        super(message || code && code.message || String(code));
        this.code = typeof code === 'string' ? code : code && code.code;
    }
}

global.CLASSES = { NodicsError };
global.UTILS = {
    isBlank: value => value === undefined || value === null || value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (value && typeof value === 'object' && Object.keys(value).length === 0)
};

let tenantProperties = {
    default: {
        featureFlags: { searchEnabled: false },
        stableSetting: true
    }
};
let runtimePropertyGovernance;
global.CONFIG = {
    get: key => {
        if (key === 'defaultTenant') return 'default';
        if (key === 'identityGovernance') return { separationOfDuties: {} };
        if (key === 'runtimePropertyGovernance') return runtimePropertyGovernance;
        return tenantProperties.default[key];
    },
    getProperties: tenant => tenantProperties[tenant],
    setProperties: (properties, tenant) => { tenantProperties[tenant] = properties; },
    changeTenantProperties: (configuration, tenant) => {
        tenantProperties[tenant] = _.merge(tenantProperties[tenant] || {}, configuration);
    }
};

let storedRequests = {};
let auditEntries = [];
global.SERVICE = {
    DefaultConfigurationActivationRequestService: {
        save: request => {
            storedRequests[request.model.code] = _.cloneDeep(request.model);
            return Promise.resolve({ result: [request.model] });
        },
        get: request => Promise.resolve({
            result: storedRequests[request.query.code] ? [_.cloneDeep(storedRequests[request.query.code])] : []
        })
    },
    DefaultRuntimeConfigurationAuditService: {
        recordActivation: entry => {
            auditEntries.push(_.cloneDeep(entry));
            return Promise.resolve({ entry: entry });
        },
        resolveRequestedBy: request => request.authData && request.authData.code,
        resolveCorrelationId: request => request.correlationId
    }
};

SERVICE.DefaultRuntimeConfigurationPreviewService = require('../src/service/audit/defaultRuntimeConfigurationPreviewService');
SERVICE.DefaultConfigurationService = require('../../nSystem/src/service/config/defaultConfigurationService');
SERVICE.DefaultRuntimeConfigurationActivationRequestService = require('../src/service/audit/defaultRuntimeConfigurationActivationRequestService');
const rollbackService = require('../src/service/audit/defaultRuntimeConfigurationRollbackService');

(async function () {
    let created = await SERVICE.DefaultRuntimeConfigurationActivationRequestService.createActivationRequest({
        tenant: 'default',
        authData: { code: 'requester' },
        correlationId: 'property-correlation',
        activationRequest: {
            code: 'propertyRequest1',
            configurationType: 'propertyConfiguration',
            configurationCode: 'tenantProperties',
            moduleName: 'system',
            configuration: { featureFlags: { searchEnabled: true }, newSetting: 'enabled' },
            requestReason: 'Enable governed runtime feature'
        }
    });
    assert.strictEqual(created.data.approvalStatus, 'PENDING');
    assert.strictEqual(created.data.riskLevel, 'HIGH');
    assert.strictEqual(tenantProperties.default.featureFlags.searchEnabled, false, 'Request creation must not mutate properties');
    assert.deepStrictEqual(created.data.preview.previousSnapshot.values, [{ path: 'featureFlags.searchEnabled', value: false }]);
    assert.deepStrictEqual(created.data.preview.previousSnapshot.missingPaths, ['newSetting']);

    await SERVICE.DefaultRuntimeConfigurationActivationRequestService.approveActivationRequest({
        tenant: 'default', authData: { code: 'approver' },
        activationRequest: { activationRequestCode: 'propertyRequest1', approvalReason: 'Approved ticket' }
    });
    await SERVICE.DefaultRuntimeConfigurationActivationRequestService.activateApprovedRequest({
        tenant: 'default', authData: { code: 'operator' }, correlationId: 'property-correlation',
        activationRequest: { activationRequestCode: 'propertyRequest1' }
    });
    assert.strictEqual(tenantProperties.default.featureFlags.searchEnabled, true);
    assert.strictEqual(tenantProperties.default.newSetting, 'enabled');
    assert.strictEqual(auditEntries[0].configurationType, 'propertyConfiguration');
    assert.deepStrictEqual(auditEntries[0].previousSnapshot.missingPaths, ['newSetting']);

    SERVICE.DefaultConfigurationActivationLogService = {
        get: () => Promise.resolve({ result: [Object.assign({ code: 'propertyActivation1' }, auditEntries[0])] })
    };
    await rollbackService.rollbackActivation({
        tenant: 'default', authData: { code: 'rollbackOperator' }, activationCode: 'propertyActivation1'
    });
    assert.strictEqual(tenantProperties.default.featureFlags.searchEnabled, false);
    assert.strictEqual(Object.prototype.hasOwnProperty.call(tenantProperties.default, 'newSetting'), false);
    assert.strictEqual(tenantProperties.default.stableSetting, true, 'Rollback must preserve unrelated properties');

    await assert.rejects(() => SERVICE.DefaultRuntimeConfigurationActivationRequestService.createActivationRequest({
        tenant: 'default', authData: { code: 'requester' },
        activationRequest: {
            configurationType: 'propertyConfiguration',
            configuration: { databasePassword: 'must-not-enter-runtime-governance' }
        }
    }), /Sensitive properties must use layered external configuration/);

    runtimePropertyGovernance = { sensitivePathPatterns: ['regulatedValue'] };
    await assert.rejects(() => SERVICE.DefaultRuntimeConfigurationActivationRequestService.createActivationRequest({
        tenant: 'default', authData: { code: 'requester' },
        activationRequest: {
            configurationType: 'propertyConfiguration',
            configuration: { customer: { regulatedValue: 'protected' } }
        }
    }), /customer.regulatedValue/);
    runtimePropertyGovernance = undefined;

    let tampered = await SERVICE.DefaultRuntimeConfigurationActivationRequestService.createActivationRequest({
        tenant: 'default', authData: { code: 'requester' },
        activationRequest: {
            code: 'propertyRequestTampered', configurationType: 'propertyConfiguration',
            configuration: { featureFlags: { searchEnabled: true } }
        }
    });
    assert(tampered.data.configurationDigest);
    await SERVICE.DefaultRuntimeConfigurationActivationRequestService.approveActivationRequest({
        tenant: 'default', authData: { code: 'approver' },
        activationRequest: { activationRequestCode: 'propertyRequestTampered' }
    });
    storedRequests.propertyRequestTampered.configuration.featureFlags.searchEnabled = false;
    await assert.rejects(() => SERVICE.DefaultRuntimeConfigurationActivationRequestService.activateApprovedRequest({
        tenant: 'default', authData: { code: 'operator' },
        activationRequest: { activationRequestCode: 'propertyRequestTampered' }
    }), /failed integrity validation/);

    console.log('Runtime property configuration governance validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
