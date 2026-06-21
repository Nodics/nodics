const assert = require('assert');
const path = require('path');

/**
 * @module import/test/mandatoryInitDataImportContract
 * @description Verifies mandatory profile bootstrap records and proves that init imports preserve selected modules, tenant scope, init type, and diagnostics through processing.
 * @layer test
 * @owner import
 * @override Projects may extend mandatory bootstrap catalogs through module-owned init headers and data while preserving tenant-scoped lifecycle behavior.
 */

global.CONFIG = {
    get: function (key) {
        if (key === 'defaultTenant') return 'default';
        if (key === 'data') return { dataDirName: 'temp' };
        if (key === 'bootstrapIdentity') return {
            adminPassword: 'test-admin-password',
            servicePassword: 'test-service-password',
            serviceApiKey: 'test-service-api-key'
        };
        return undefined;
    }
};
global.NODICS = {
    getServerPath: function () { return '/tmp/nodics-server'; }
};

const repoRoot = path.resolve(__dirname, '../../../../../');
const enterpriseHeader = require(path.join(repoRoot, 'gCore/profile/data/init/headers/enterprise/defaultEnterpriseHeader'));
const tenantHeader = require(path.join(repoRoot, 'gCore/profile/data/init/headers/enterprise/defaultTenantsHeader'));
const groupHeader = require(path.join(repoRoot, 'gCore/profile/data/init/headers/groups/defaultUserGroupsHeader'));
const userHeader = require(path.join(repoRoot, 'gCore/profile/data/init/headers/user/defaultUsersHeader'));
const enterpriseData = require(path.join(repoRoot, 'gCore/profile/data/init/data/enterprise/defaultEnterpriseData'));
const tenantData = require(path.join(repoRoot, 'gCore/profile/data/init/data/enterprise/defaultTenantsData'));
const groupData = require(path.join(repoRoot, 'gCore/profile/data/init/data/groups/defaultUserGroupsData'));
const userData = require(path.join(repoRoot, 'gCore/profile/data/init/data/user/defaultEmployeeData'));
const importService = require('../src/service/import/defaultImportService');
const diagnostics = require('../src/service/diagnostics/defaultImportDiagnosticsService');

assert.strictEqual(enterpriseHeader.profile.defaultEnterprise.options.enabled, true);
assert.deepStrictEqual(enterpriseHeader.profile.defaultEnterprise.options.tenants, ['default']);
assert.strictEqual(tenantHeader.profile.defaultTenants.options.schemaName, 'tenant');
assert.deepStrictEqual(tenantHeader.profile.defaultTenants.options.tenants, ['default']);
assert.strictEqual(groupHeader.profile.defaultUserGroups.options.schemaName, 'userGroup');
assert.strictEqual(userHeader.profile.defaultEmployee.options.schemaName, 'employee');
assert.strictEqual(enterpriseData.record0.code, 'default');
assert.strictEqual(tenantData.record0.code, 'default');
assert(Object.values(groupData).some(group => group.code === 'serviceAccountUserGroup'));
assert(Object.values(userData).some(user => user.code === 'apiAdmin' && user.principalType === 'service'));

let initializedRequest;
let processedRequest;
global.SERVICE = {
    DefaultImportDiagnosticsService: diagnostics,
    DefaultPipelineService: {
        start: function (pipelineName, request) {
            if (pipelineName === 'systemDataImportInitializerPipeline') {
                initializedRequest = request;
                request.importRun = {
                    runId: 'mandatory_init_run',
                    startedAt: new Date().toISOString(),
                    dataType: request.dataType,
                    tenant: request.tenant,
                    modules: [].concat(request.modules),
                    summary: {}, failures: [], validationErrors: []
                };
                return Promise.resolve({ code: 'SUC_IMP_READY' });
            }
            if (pipelineName === 'processDataImportPipeline') {
                processedRequest = request;
                return Promise.resolve({ processed: true });
            }
            return Promise.reject(new Error('Unexpected pipeline: ' + pipelineName));
        }
    }
};

(async function () {
    const result = await importService.importInitData({
        tenant: 'nodicsTest',
        modules: ['profile', 'BlueBoundary']
    });
    assert.strictEqual(initializedRequest.dataType, 'init');
    assert.deepStrictEqual(initializedRequest.modules, ['profile', 'BlueBoundary']);
    assert.strictEqual(processedRequest.tenant, 'nodicsTest');
    assert.strictEqual(processedRequest.inputPath.dataType, 'init');
    assert.strictEqual(processedRequest.importRun.runId, 'mandatory_init_run');
    assert.strictEqual(result.importRun.status, 'COMPLETED');
    console.log('Mandatory init-data import contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
