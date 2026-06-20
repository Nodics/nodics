/**
 * @module service/identity/DefaultIdentityGovernanceService
 * @description Supplies layered identity governance decisions for trusted
 * framework operations and administrative access checks.
 * @layer service
 * @owner nAuth
 */
module.exports = {
    getConfiguration: function () {
        return CONFIG.get('identityGovernance') || {};
    },

    getSystemAuthData: function () {
        let configuration = this.getConfiguration();
        return {
            isSystem: true,
            userGroups: (configuration.systemAccessGroups || []).slice(),
            permissions: []
        };
    },

    hasAdministrativeAccess: function (authData) {
        let groups = authData && Array.isArray(authData.userGroups) ? authData.userGroups : [];
        let administrativeGroups = this.getConfiguration().administrativeGroups || [];
        return groups.some(group => administrativeGroups.includes(group));
    }
};
