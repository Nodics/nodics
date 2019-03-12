/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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

    doRefresh: function (request) {
        return SERVICE.srvcName.doRefresh(request);
    },

    doExistItem: function (request) {
        return SERVICE.srvcName.doExistItem(request);
    },

    doExists: function (request) {
        return SERVICE.srvcName.doExists(request);
    },

    doCheckHealth: function (request) {
        return SERVICE.srvcName.doCheckHealth(request);
    },

    doIndex: function (request) {
        return SERVICE.srvcName.doIndex(request);
    },

    doGet: function (request) {
        return SERVICE.srvcName.doGet(request);
    },

    doSearch: function (request) {
        return SERVICE.srvcName.doSearch(request);
    },

    doSave: function (request) {
        return SERVICE.srvcName.doSave(request);
    },

    doRemove: function (request) {
        return SERVICE.srvcName.doRemove(request);
    },

    doRemoveByQuery: function (request) {
        return SERVICE.srvcName.doRemoveByQuery(request);
    },

    doGetMapping: function (request) {
        return SERVICE.srvcName.doGetMapping(request);
    },

    doUpdateMapping: function (request) {
        return SERVICE.srvcName.doUpdateMapping(request);
    },

    doRemoveIndex: function (request) {
        return SERVICE.srvcName.doRemoveIndex(request);
    }
};