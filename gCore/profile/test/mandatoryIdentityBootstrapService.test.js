const assert = require('assert');

/**
 * @module profile/test/mandatoryIdentityBootstrapService
 * @description Verifies idempotent, audited creation of missing configured identity groups without overwriting existing tenant customizations.
 * @layer test
 * @owner profile
 * @override Projects may extend group targets and bootstrap services through layered configuration.
 */

const groups = [
    { code: 'userGroup', active: true, parentGroups: [] },
    { code: 'adminGroup', active: true, parentGroups: ['customParent'] }
];
const saved = [];
const audits = [];

global.CONFIG = {
    /** Returns layered identity-governance test configuration. */
    get: function (key) {
        if (key === 'defaultTenant') return 'default';
        if (key === 'identityGovernance') return {
            migration: {
                version: 2,
                reconcileMissingGroupsOnStartup: true,
                groupTargets: {
                    childServiceGroup: { parentGroups: ['parentServiceGroup'] },
                    parentServiceGroup: { parentGroups: ['userGroup'] },
                    userGroup: { parentGroups: [] },
                    adminGroup: { parentGroups: ['userGroup'] },
                    serviceAccountUserGroup: { parentGroups: ['userGroup'], permissions: ['auth.internal.token.read'] }
                }
            }
        };
    }
};
global.SERVICE = {
    DefaultIdentityGovernanceService: {
        /** Returns system authorization for generated service calls. */
        getSystemAuthData: function () { return { isSystem: true }; }
    },
    DefaultUserGroupService: {
        /** Returns mutable in-memory group fixtures. */
        get: function () { return Promise.resolve({ result: groups.slice() }); },
        /** Saves missing group fixtures as one hierarchy-aware batch. */
        saveAll: function (request) {
            const models = [].concat(request.models || []);
            saved.push(...models);
            groups.push(...models);
            return Promise.resolve({ result: request.models });
        }
    },
    DefaultIdentityMigrationAuditService: {
        /** Captures sanitized bootstrap audit fixtures. */
        save: function (request) {
            audits.push(request.model);
            return Promise.resolve({ result: request.model });
        }
    }
};

const service = require('../src/service/identity/defaultMandatoryIdentityBootstrapService');

(async function () {
    const first = await service.reconcile({ tenant: 'default', correlationId: 'bootstrap-test' });
    assert.deepStrictEqual(first, {
        status: 'RECONCILED',
        createdGroups: ['parentServiceGroup', 'childServiceGroup', 'serviceAccountUserGroup']
    });
    assert.strictEqual(saved.length, 3);
    assert(saved.findIndex(group => group.code === 'parentServiceGroup') < saved.findIndex(group => group.code === 'childServiceGroup'));
    assert.strictEqual(groups.find(group => group.code === 'adminGroup').parentGroups[0], 'customParent');
    assert.strictEqual(audits.length, 1);
    assert.deepStrictEqual(audits[0].result.createdGroups, ['parentServiceGroup', 'childServiceGroup', 'serviceAccountUserGroup']);

    const second = await service.reconcile({ tenant: 'default' });
    assert.deepStrictEqual(second, { status: 'NO_CHANGES', createdGroups: [] });
    assert.strictEqual(saved.length, 3);
    assert.strictEqual(audits.length, 1);
    console.log('Mandatory identity bootstrap reconciliation validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
