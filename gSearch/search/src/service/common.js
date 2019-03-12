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
        return DAO.DaoName.doRefresh(request);
    },

    doExistItem: function (request) {
        return DAO.DaoName.doExistItem(request);
    },


    doExists: function (request) {
        return DAO.DaoName.doExists(request);
    },

    doCheckHealth: function (request) {
        return DAO.DaoName.doCheckHealth(request);
    },

    doIndex: function (request) {
        return DAO.DaoName.doIndex(request);
    },

    doGet: function (request) {
        return DAO.DaoName.doGet(request);
    },

    doSearch: function (request) {
        return DAO.DaoName.doSearch(request);
    },

    doSave: function (request) {
        return DAO.DaoName.doSave(request);
    },

    doRemove: function (request) {
        return DAO.DaoName.doRemove(request);
    },

    doRemoveByQuery: function (request) {
        return DAO.DaoName.doRemoveByQuery(request);
    },

    doGetMapping: function (request) {
        return DAO.DaoName.doGetMapping(request);
    },

    doUpdateMapping: function (request) {
        return DAO.DaoName.doUpdateMapping(request);
    },

    doRemoveIndex: function (request) {
        return DAO.DaoName.doRemoveIndex(request);
    }
};