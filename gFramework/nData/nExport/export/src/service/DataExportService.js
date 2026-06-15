/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    /**
     * Initializes the data export service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the data export service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Default export operation contract.
     *
     * @param {Object} request Export request.
     * @returns {Promise<Object>} Rejects until an active module overrides export behavior.
     */
    export: function (request) {
        return new Promise((resolve, reject) => {
            reject(new CLASSES.NodicsError(
                'ERR_SYS_00001',
                'Data export service is not configured. Override DataExportService.export in an active module to provide export behavior'
            ));
        });
    },

    /**
     * Applies schema/property export access policies to exported models.
     *
     * @param {Object} request Export request with schemaModel and authData.
     * @param {Object[]} models Models selected for export.
     * @returns {Promise<Object[]>} Export-safe models.
     */
    applyExportAccessPolicies: function (request, models) {
        if (!SERVICE.DefaultSchemaReadAccessPolicyService ||
            typeof SERVICE.DefaultSchemaReadAccessPolicyService.applyExportPolicies !== 'function') {
            return Promise.resolve(models);
        }
        return SERVICE.DefaultSchemaReadAccessPolicyService.applyExportPolicies(request, {
            success: {
                result: models || []
            }
        }).then(response => {
            return response.success.result;
        });
    }
};
