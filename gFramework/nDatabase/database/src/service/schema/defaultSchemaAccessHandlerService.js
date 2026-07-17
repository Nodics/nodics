/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module database/service/schema/DefaultSchemaAccessHandlerService
 * @description Resolves the highest schema access point allowed for an
 * authenticated user based on schema access groups. Generated services use this
 * contract to enforce schema-level authorization without hardcoding project
 * roles.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override access calculation to integrate
 * enterprise IAM, custom role hierarchies, or tenant-specific authorization
 * while preserving schema-driven access point semantics.
 *
 * @property {Object} CONFIG.accessPoints.fullAccessPoint Default access point used when schema has no access groups.
 * @property {Object} authData.userGroups Authenticated user groups from the request token.
 */
module.exports = {
    /**
     * Initializes the schema access handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the schema access handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Calculates the highest access point granted by matching user groups.
     *
     * @param {Object} authData Authentication context from the request.
     * @param {string[]} authData.userGroups User groups resolved from token or session.
     * @param {Object} modelAccessGroups Schema access group map where values are access points.
     * @returns {number} Highest access point granted to the user.
     * @throws {CLASSES.NodicsError} When access groups are configured but user groups are missing.
     */
    getAccessPoint: function (authData, modelAccessGroups) {
        try {
            if (!modelAccessGroups || UTILS.isBlank(modelAccessGroups)) {
                return CONFIG.get('accessPoints').fullAccessPoint;
            } else if (!authData || !authData.userGroups) {
                if (typeof NODICS !== 'undefined' && NODICS && typeof NODICS.getServerState === 'function' && NODICS.getServerState() !== 'started') {
                    return CONFIG.get('accessPoints').fullAccessPoint;
                }
                throw new CLASSES.NodicsError('Invalid request, could not found user groups');
            } else {
                let accessPoint = 0;
                let filterGroups = authData.userGroups.filter(userGroup => Object.keys(modelAccessGroups).includes(userGroup));
                filterGroups.forEach(group => {
                    if (accessPoint < modelAccessGroups[group]) {
                        accessPoint = modelAccessGroups[group];
                    }
                });
                return accessPoint;
            }
        } catch (error) {
            throw new CLASSES.NodicsError(error, null, 'ERR_DBS_00000');
        }
    }
};
