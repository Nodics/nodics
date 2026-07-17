/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/facade/schema/DefaultSchemaValidatorFacade
 * @description Facade boundary for schema validator maintenance. It provides a
 * stable controller-facing contract while delegating database validator refresh
 * to the schema validator service.
 * @layer facade
 * @owner nDatabase
 * @override Project modules may override this facade to add authorization,
 * audit, validation, or async job orchestration without changing controllers or
 * services.
 */
module.exports = {
    /**
     * Updates validators for one schema in one module.
     *
     * @param {string} moduleName Owning module name.
     * @param {string} schemaName Schema code.
     * @returns {Promise<Object[]>} Schema validator update response.
     */
    updateSchemaValidator: function (moduleName, schemaName) {
        return SERVICE.DefaultSchemaValidatorService.updateSchemaValidator(moduleName, schemaName);
    },

    /**
     * Updates validators for every schema in one module.
     *
     * @param {string} moduleName Owning module name.
     * @returns {Promise<Object[]>} Module validator update response.
     */
    updateModuleSchemaValidators: function (moduleName) {
        return SERVICE.DefaultSchemaValidatorService.updateModuleSchemaValidators(moduleName);
    },

    /**
     * Updates validators for every schema in every active module.
     *
     * @returns {Promise<Object[]>} Global validator update response.
     */
    updateModulesSchemaValidators: function () {
        return SERVICE.DefaultSchemaValidatorService.updateModulesSchemaValidators();
    },
};
