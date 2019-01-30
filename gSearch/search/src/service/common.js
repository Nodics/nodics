/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

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

    doRemoveType: function (request) {
        return DAO.DaoName.doRemoveType(request);
    }
};