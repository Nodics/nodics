/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/service/model/DefaultModelValidatorService
 * @description Default model validation extension point for generated save and
 * update flows. The base implementation is intentionally permissive and exists
 * so project modules can layer stricter mandatory-field and datatype checks.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override these validators to enforce
 * enterprise-specific rules while preserving generated CRUD validator contracts.
 *
 * @property {Object} model Model being validated.
 * @property {Object} schemaDef Effective schema definition for the model.
 */
module.exports = {

    /**
     * Initializes the model validator service.
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
     * Finalizes the model validator service.
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
     * Validates mandatory schema values.
     *
     * @param {Object} model Model being validated.
     * @param {Object} schemaDef Effective schema definition.
     * @returns {Promise<boolean>} Resolves true in the default implementation.
     */
    validateMandate: function (model, schemaDef) {
        this.LOG.debug('Validating mandate values for model');
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Validates model value datatypes.
     *
     * @param {Object} model Model being validated.
     * @param {Object} schemaDef Effective schema definition.
     * @returns {Promise<boolean>} Resolves true in the default implementation.
     */
    validateDataType: function (model, schemaDef) {
        this.LOG.debug('Validating value type for model');
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
};
