const assert = require('assert');

global.SERVICE = {};
global.CLASSES = {
    DataImportError: class DataImportError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error || code);
            this.code = code || (error && error.code) || error;
            this.cause = error;
        }
    },
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error || code);
            this.code = code || error;
            this.metadata = error && error.metadata;
        }
    }
};

global.NODICS = {
    getModule: function () {
        return {
            rawSchema: {
                product: {
                    definition: {
                        code: { type: 'string' },
                        productDescription: { type: 'string' },
                        internalCost: { type: 'number' }
                    }
                }
            }
        };
    }
};

const importModelProcessService = require('../src/service/process/model/defaultModelImportProcessService');
const importPipelines = require('../src/pipelines/pipelinesDefinition');
const dataExportService = require('../../../nExport/export/src/service/DataExportService');

let importRequest = {
    tenant: 'electronics',
    header: {
        options: {
            moduleName: 'catalog',
            schemaName: 'product',
            userGroups: ['catalogImporterUserGroup']
        }
    },
    dataModel: {
        code: 'product-001',
        internalCost: 42
    }
};

importModelProcessService.LOG = {
    debug: function () {}
};

importModelProcessService.loadRawSchema(importRequest, {}, {
    nextSuccess: function () {},
    error: function (req, res, error) {
        throw error;
    }
});

global.SERVICE.DefaultSchemaWriteAccessPolicyService = {
    enforceImportPolicies: function (policyRequest) {
        assert.strictEqual(policyRequest.tenant, 'electronics');
        assert.deepStrictEqual(policyRequest.authData.userGroups, ['catalogImporterUserGroup']);
        assert.strictEqual(policyRequest.schemaModel.moduleName, 'catalog');
        assert.strictEqual(policyRequest.schemaModel.schemaName, 'product');
        assert.strictEqual(policyRequest.model.internalCost, 42);
        let error = new global.CLASSES.NodicsError('ERR_AUTH_00003', 'blocked');
        error.metadata = {
            action: 'import',
            violations: [{
                propertyName: 'internalCost',
                effect: 'DENY',
                policyCode: 'denyCostImport'
            }]
        };
        return Promise.reject(error);
    }
};

new Promise((resolve, reject) => {
    importModelProcessService.enforceImportAccessPolicies(importRequest, {}, {
        nextSuccess: function () {
            reject(new Error('Protected import payload should not advance'));
        },
        error: function (req, res, error) {
            assert(error instanceof global.CLASSES.DataImportError);
            assert.strictEqual(error.code, 'ERR_IMP_00003');
            assert.strictEqual(error.cause.code, 'ERR_AUTH_00003');
            resolve(true);
        }
    });
}).then(() => {
    assert.strictEqual(
        importPipelines.processModelImportPipeline.nodes.loadRawSchema.success,
        'enforceImportAccessPolicies'
    );
    assert.strictEqual(
        importPipelines.processModelImportPipeline.nodes.enforceImportAccessPolicies.handler,
        'DefaultModelImportProcessService.enforceImportAccessPolicies'
    );

    let exportModels = [{
        code: 'product-001',
        internalCost: 42
    }];
    global.SERVICE.DefaultSchemaReadAccessPolicyService = {
        applyExportPolicies: function (request, response) {
            assert.strictEqual(request.schemaModel.schemaName, 'product');
            delete response.success.result[0].internalCost;
            response.success.policy = {
                action: 'export',
                appliedCount: 1
            };
            return Promise.resolve(response);
        }
    };
    return dataExportService.applyExportAccessPolicies({
        schemaModel: {
            schemaName: 'product'
        }
    }, exportModels);
}).then(filteredModels => {
    assert.strictEqual(filteredModels[0].code, 'product-001');
    assert.strictEqual(filteredModels[0].internalCost, undefined);
    console.log('Import/export access policy behavior validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
