/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/facade/schema/DefaultSchemaIndexFacade
 * @description Facade boundary for schema index maintenance. It provides a
 * stable controller-facing contract while delegating actual index work to the
 * schema index service.
 * @layer facade
 * @owner nDatabase
 * @override Project modules may override this facade to add authorization,
 * audit, validation, or async job orchestration without changing controllers or
 * services.
 */
module.exports = {
    /**
     * Updates indexes for one schema in one module.
     *
     * @param {string} moduleName Owning module name.
     * @param {string} schemaName Schema code.
     * @returns {Promise<Object[]>} Schema index update response.
     */
    updateSchemaIndexes: function (moduleName, schemaName) {
        return SERVICE.DefaultSchemaIndexService.updateSchemaIndexes(moduleName, schemaName);
    },

    /**
     * Updates indexes for every schema in one module.
     *
     * @param {string} moduleName Owning module name.
     * @returns {Promise<Object[]>} Module index update response.
     */
    updateModuleIndexes: function (moduleName) {
        return SERVICE.DefaultSchemaIndexService.updateModuleIndexes(moduleName);
    },

    /**
     * Updates indexes for every schema in every active module.
     *
     * @returns {Promise<Object[]>} Global index update response.
     */
    updateModulesIndexes: function () {
        return SERVICE.DefaultSchemaIndexService.updateModulesIndexes();
    }
};
