const assert = require('assert');

/**
 * @module import/test/importTenantPrecedence
 * @description Verifies that request-scoped tenants narrow effective import-header tenants, never broaden them, and fail closed for inactive or unauthorized tenant targets.
 * @layer test
 * @owner import
 * @override Project modules may add tenant-policy fixtures while preserving the platform narrowing and fail-closed contract.
 */

global.CLASSES = {
    DataImportError: function DataImportError(code, message) {
        this.code = code;
        this.message = message;
    }
};
global.NODICS = {
    getActiveTenants: function () {
        return ['default', 'nodicsTest'];
    }
};

const processor = require('../src/service/process/file/defaultFileDataImportProcessService');
const service = Object.assign({}, processor, { LOG: { warn: function () {} } });

let request = { tenant: 'nodicsTest', importRun: {} };
assert.deepStrictEqual(service.resolveTargetTenants(request, { options: { tenants: ['default', 'nodicsTest'] } }), ['nodicsTest']);
assert.deepStrictEqual(request.importRun.targetTenants, ['nodicsTest']);

assert.deepStrictEqual(service.resolveTargetTenants({ importRun: {} }, { options: { tenants: ['default', 'inactive', 'nodicsTest'] } }), ['default', 'nodicsTest']);
assert.deepStrictEqual(service.resolveTargetTenants({ importRun: {} }, { options: {} }), ['default', 'nodicsTest']);

let excludedRequest = { tenant: 'nodicsTest', importRun: {} };
assert.deepStrictEqual(service.resolveTargetTenants(excludedRequest, { options: { tenants: ['default'] } }), []);
assert.deepStrictEqual(excludedRequest.importRun.tenantExclusions, [{ requestedTenant: 'nodicsTest', headerTenants: ['default'] }]);

assert.throws(() => service.resolveTargetTenants(
    { tenant: 'missingTenant', importRun: {} },
    { options: { tenants: ['missingTenant'] } }
), error => error.code === 'ERR_IMP_00003' && /not active/.test(error.message));

console.log('Import tenant precedence contract validated');
