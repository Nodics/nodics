/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSearch/search/src/facade/common
 * @description Coordinates facade-level delegation for nSearch common operations.
 * @layer facade
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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

     * Executes do refresh behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doRefresh: function (request) {
        return SERVICE.srvcName.doRefresh(request);
    },

    /**

     * Executes do check health behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doCheckHealth: function (request) {
        return SERVICE.srvcName.doCheckHealth(request);
    },

    /**

     * Executes do exists behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doExists: function (request) {
        return SERVICE.srvcName.doExists(request);
    },

    /**

     * Executes do get behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doGet: function (request) {
        return SERVICE.srvcName.doGet(request);
    },

    /**

     * Executes do search behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doSearch: function (request) {
        return SERVICE.srvcName.doSearch(request);
    },

    /**

     * Executes do save behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doSave: function (request) {
        return SERVICE.srvcName.doSave(request);
    },

    /**

     * Executes do bulk behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doBulk: function (request) {
        return SERVICE.srvcName.doBulk(request);
    },

    /**

     * Executes do remove behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doRemove: function (request) {
        return SERVICE.srvcName.doRemove(request);
    },

    /**

     * Executes do remove by query behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doRemoveByQuery: function (request) {
        return SERVICE.srvcName.doRemoveByQuery(request);
    },

    /**

     * Executes do get schema behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doGetSchema: function (request) {
        return SERVICE.srvcName.doGetSchema(request);
    },

    /**

     * Executes do update schema behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doUpdateSchema: function (request) {
        return SERVICE.srvcName.doUpdateSchema(request);
    },

    /**

     * Executes do remove index behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doRemoveIndex: function (request) {
        return SERVICE.srvcName.doRemoveIndex(request);
    },

    /**

     * Executes do indexing behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    doIndexing: function (request) {
        return SERVICE.srvcName.doIndexing(request);
    }
};