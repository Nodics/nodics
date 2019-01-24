/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    doExists: function (request, callback) {
        if (request.httpRequest.params.id) {
            request.query = {
                id: request.httpRequest.params.id
            };
        }
        if (callback) {
            FACADE.dsdName.doExists(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doExists(request);
        }
    },

    doCheckHealth: function (request) {
        if (callback) {
            FACADE.dsdName.doCheckHealth(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doCheckHealth(request);
        }
    },

    doGet: function (request) {
        if (request.httpRequest.params.id) {
            request.query = {
                id: request.httpRequest.params.id
            };
        }
        if (callback) {
            FACADE.dsdName.doGet(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doGet(request);
        }
    },

    doSearch: function (request) {
        if (request.httpRequest.params.id) {
            request.query = {
                match: {
                    id: request.httpRequest.params.id
                }
            };
        } else {
            request = _.merge(request, request.httpRequest.body || {});
        }
        if (callback) {
            FACADE.dsdName.doSearch(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doSearch(request);
        }
    },

    doSave: function (request) {
        request.models = request.httpRequest.body;
        if (callback) {
            FACADE.dsdName.doSave(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doSave(request);
        }
    },

    doRemove: function (request) {
        if (request.httpRequest.params.id) {
            request.query = {
                id: request.httpRequest.params.id
            };
        }
        if (callback) {
            FACADE.dsdName.doRemove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doRemove(request);
        }
    },

    doRemoveByQuery: function (request) {
        request = _.merge(request, request.httpRequest.body || {});
        if (callback) {
            FACADE.dsdName.doRemoveByQuery(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.doRemoveByQuery(request);
        }
    },

    getMapping: function (request) {
        if (callback) {
            FACADE.dsdName.getMapping(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.getMapping(request);
        }
    },

    updateMapping: function (request) {
        if (callback) {
            FACADE.dsdName.updateMapping(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.updateMapping(request);
        }
    },

    removeType: function (request) {
        if (callback) {
            FACADE.dsdName.removeType(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.removeType(request);
        }
    }
};