/**
 * @module service/identity/DefaultIdentityGovernanceService
 * @description Supplies layered identity governance decisions for trusted
 * framework operations and administrative access checks.
 * @layer service
 * @owner nAuth
 */
module.exports = {
    /**
     * Retrieves configuration information.
     *
     * @returns {*} Method result.
     */
    getConfiguration: function () {
        return CONFIG.get('identityGovernance') || {};
    },

    /**

     * Retrieves system auth data information.

     *

     * @returns {*} Method result.

     */

    getSystemAuthData: function () {
        let configuration = this.getConfiguration();
        return {
            isSystem: true,
            userGroups: (configuration.systemAccessGroups || []).slice(),
            permissions: []
        };
    },

    /**

     * Validates administrative access rules.

     *

     * @param {*} authData Method input.

     * @returns {*} Method result.

     */

    hasAdministrativeAccess: function (authData) {
        let groups = authData && Array.isArray(authData.userGroups) ? authData.userGroups : [];
        let administrativeGroups = this.getConfiguration().administrativeGroups || [];
        return groups.some(group => administrativeGroups.includes(group));
    }
};
