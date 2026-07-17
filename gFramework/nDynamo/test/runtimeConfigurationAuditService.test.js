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

let savedModel;
let historyRequest;
global.SERVICE = {
    DefaultConfigurationActivationLogService: {
        save: function (request) {
            savedModel = request.model;
            return Promise.resolve({
                success: true,
                result: [request.model]
            });
        },
        get: function (request) {
            historyRequest = request;
            return Promise.resolve({
                result: [{
                    code: 'routerConfiguration_runtimeUser_1',
                    configurationType: 'routerConfiguration',
                    configurationCode: 'runtimeUser',
                    moduleName: 'profile',
                    action: 'activate',
                    status: 'SUCCESS'
                }]
            });
        }
    }
};

const service = require('../src/service/audit/defaultRuntimeConfigurationAuditService');
service.LOG = {
    warn: function () {},
    error: function () {}
};

service.recordActivation({
    configurationType: 'routerConfiguration',
    configurationCode: 'runtimeUser',
    moduleName: 'profile',
    status: 'SUCCESS',
    requestedBy: 'admin'
}).then(() => {
    assert.strictEqual(savedModel.configurationType, 'routerConfiguration');
    assert.strictEqual(savedModel.configurationCode, 'runtimeUser');
    assert.strictEqual(savedModel.moduleName, 'profile');
    assert.strictEqual(savedModel.requestedBy, 'admin');
    assert(savedModel.code.startsWith('routerConfiguration_runtimeUser_'));

    return service.getActivationHistory({
        tenant: 'default',
        httpRequest: {
            query: {
                configurationType: 'routerConfiguration',
                moduleName: 'profile',
                approvalStatus: 'APPROVED',
                riskLevel: 'HIGH',
                activationRequestCode: 'activationRequest_routerConfiguration_runtimeUser',
                limit: '10'
            }
        }
    });
}).then(history => {
    assert.strictEqual(history.code, 'SUC_SYS_00000');
    assert.strictEqual(history.data.length, 1);
    assert.strictEqual(history.metadata.query.configurationType, 'routerConfiguration');
    assert.strictEqual(history.metadata.query.approvalStatus, 'APPROVED');
    assert.strictEqual(history.metadata.query.riskLevel, 'HIGH');
    assert.strictEqual(history.metadata.query.activationRequestCode, 'activationRequest_routerConfiguration_runtimeUser');
    assert.strictEqual(history.metadata.tenant, 'default');
    assert.strictEqual(historyRequest.query.moduleName, 'profile');
    assert.strictEqual(historyRequest.searchOptions.limit, 10);

    delete global.SERVICE.DefaultConfigurationActivationLogService;
    return service.recordActivation({
        configurationType: 'schemaConfiguration',
        configurationCode: 'tenant'
    });
}).then(success => {
    assert.strictEqual(success.skipped, true);
    assert.strictEqual(success.entry.configurationCode, 'tenant');
    console.log('Runtime configuration audit service validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
