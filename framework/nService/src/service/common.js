/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function (request, callback) {
        if (callback) {
            DAO.DaoName.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.get(request);
        }
    },

    getById: function (id, tenant, callback) {
        if (callback) {
            DAO.DaoName.getById(id, tenant).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.getById(id, tenant);
        }
    },

    getByCode: function (code, tenant, callback) {
        if (callback) {
            DAO.DaoName.getByCode(code, tenant).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.getByCode(code, tenant);
        }
    },

    save: function (request, callback) {
        if (callback) {
            DAO.DaoName.save(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.save(request);
        }
    },

    remove: function (request, callback) {
        if (callback) {
            DAO.DaoName.remove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.remove(request);
        }
    },

    removeById: function (request, callback) {
        if (callback) {
            DAO.DaoName.removeById(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.removeById(request);
        }
    },
    removeByCode: function (request, callback) {
        if (callback) {
            DAO.DaoName.removeByCode(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.removeByCode(request);
        }
    },

    update: function (request, callback) {
        if (callback) {
            DAO.DaoName.update(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.update(request);
        }
    }
};