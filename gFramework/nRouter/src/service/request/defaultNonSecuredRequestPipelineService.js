/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module router/service/request/DefaultNonSecuredRequestPipelineService
 * @description Non-secured API request pipeline that validates enterprise code,
 * resolves enterprise metadata, and derives the active tenant for public or
 * pre-authentication routes.
 * @layer pipeline
 * @owner nRouter
 * @override Project modules may override this service or non-secured request
 * pipeline definition to change enterprise lookup, tenant resolution, or public API governance.
 *
 * @property {Object} CLASSES.NodicsError Standard Nodics error class used for enterprise and tenant failures.
 * @property {Object} CONFIG Runtime configuration registry used for default tenant fallback.
 * @property {Object} SERVICE.DefaultEnterpriseProviderService Loads enterprise metadata before tenant resolution.
 * @property {string} request.entCode Enterprise code parsed from modern or legacy request headers.
 * @property {Object} request.enterprise Enterprise definition loaded by the provider service.
 * @property {string} request.tenant Active tenant resolved from the loaded enterprise.
 */
module.exports = {
    /**
     * Initializes the non-secured request pipeline service during service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the non-secured request pipeline service after service loading.
     *
     * @param {Object} options Nodics initialization options for the active module hierarchy.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Validates that a public request still identifies an enterprise.
     *
     * @param {Object} request Nodics request context.
     * @param {string} request.entCode Enterprise code parsed from headers.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @throws Emits `ERR_ENT_00000` when enterprise code is missing.
     */
    validateEntCode: function (request, response, process) {
        this.LOG.debug('Validating Enterprise code : ' + request.entCode);
        if (UTILS.isBlank(request.entCode)) {
            this.LOG.error('Enterprise code can not be null');
            process.error(request, response, new CLASSES.NodicsError('ERR_ENT_00000'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Loads enterprise metadata and switches the active request tenant to the enterprise tenant.
     *
     * @param {Object} request Nodics request context.
     * @param {string} request.entCode Enterprise code to load.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @sideEffects Temporarily uses default tenant for lookup, then writes `request.enterprise` and `request.tenant`.
     * @throws Propagates enterprise provider errors through the pipeline.
     */
    loadEnterprise: function (request, response, process) {
        this.LOG.debug('Loading Enterprise code : ' + request.entCode);
        try {
            request.tenant = CONFIG.get('defaultTenant') || 'default';
            SERVICE.DefaultEnterpriseProviderService.loadEnterprise(request).then(response => {
                request.enterprise = response;
                request.tenant = response.tenant.code;
                process.nextSuccess(request, response);
            }).catch(error => {
                this.LOG.error('Enterprise code is not valid');
                process.error(request, response, error);
            });
        } catch (error) {
            this.LOG.error('Enterprise code is not valid: ', error);
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_ENT_00000'));
        }
    },

    /**
     * Verifies that enterprise resolution produced an active tenant id.
     *
     * @param {Object} request Nodics request context.
     * @param {string} request.tenant Active tenant expected after enterprise lookup.
     * @param {Object} response Nodics response context.
     * @param {Object} process Pipeline process controller.
     * @returns {void}
     * @throws Emits tenant or enterprise errors when tenant is blank or invalid.
     */
    validateTenantId: function (request, response, process) {
        this.LOG.debug('Validating Tenant Id : ' + request.tenant);
        try {
            if (UTILS.isBlank(request.tenant)) {
                this.LOG.error('Tenant is null or invalid');
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_ENT_00000'));
            } else {
                process.nextSuccess(request, response);
            }
        } catch (err) {
            process.error(request, response, new CLASSES.NodicsError('ERR_TNT_00000', 'Tenant is null or invalid'));
        }
    }
};
