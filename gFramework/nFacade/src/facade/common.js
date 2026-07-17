/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nFacade/src/facade/common
 * @description Template facade used by generated schema facades. During
 * generation, placeholders are replaced with the owning facade, service, and
 * schema identifiers.
 * @layer template
 * @owner nFacade
 * @sourceTemplate /src/facade/common.js
 * @override This file is consumed by build generators and is not loaded into
 * FACADE directly. Project modules override generated `*Facade.js` artifacts
 * or contribute same-name facade files through `src/facade/**`.
 */
module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Retrieves  information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    get: function (request) {
        return SERVICE.srvcName.get(request);
    },

    /**

     * Retrieves by id information.

     *

     * @param {*} id Method input.

     * @param {*} tenant Method input.

     * @returns {*} Method result.

     */

    getById: function (id, tenant) {
        return SERVICE.srvcName.getById(id, tenant);
    },

    /**

     * Retrieves by code information.

     *

     * @param {*} code Method input.

     * @param {*} tenant Method input.

     * @returns {*} Method result.

     */

    getByCode: function (code, tenant) {
        return SERVICE.srvcName.getByCode(code, tenant);
    },

    /**

     * Updates  information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    save: function (request) {
        return SERVICE.srvcName.save(request);
    },

    /**

     * Updates all information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    saveAll: function (request) {
        return SERVICE.srvcName.saveAll(request);
    },

    /**

     * Removes or clears  information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    remove: function (request) {
        return SERVICE.srvcName.remove(request);
    },

    /**

     * Removes or clears by id information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    removeById: function (request) {
        return SERVICE.srvcName.remove(request);
    },

    /**

     * Removes or clears by code information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    removeByCode: function (request) {
        return SERVICE.srvcName.remove(request);
    },

    /**

     * Updates  information.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    update: function (request) {
        return SERVICE.srvcName.update(request);
    }
};
