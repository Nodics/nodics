/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

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

    getMapping: function (request) {
        return SERVICE.srvcName.getMapping(request);
    },

    updateMapping: function (request) {
        return SERVICE.srvcName.updateMapping(request);
    },

    removeType: function (request) {
        return SERVICE.srvcName.removeType(request);
    },

    fullIndex: function (request) {
        return SERVICE.srvcName.fullIndex(request);
    },

    incrementalIndex: function (request) {
        return SERVICE.srvcName.incrementalIndex(request);
    }
};