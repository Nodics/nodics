/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    get: function(request, callback) {
        DAO.daoName.get(request).then((models) => {
            callback(null, models);
        }).catch((error) => {
            callback(error, null);
        });
    },

    getById: function(request, callback) {
        DAO.daoName.getById(request).then((models) => {
            callback(null, models);
        }).catch((error) => {
            callback(error, null);
        });
    },

    getByCode: function(request, callback) {
        DAO.daoName.getByCode(request).then((models) => {
            callback(null, models);
        }).catch((error) => {
            callback(error, null);
        });
    },

    save: function(request, callback) {
        DAO.daoName.save(request).then((models) => {
            callback(null, models);
        }).catch((error) => {
            callback(error, null);
        });
    },

    removeById: function(request, callback) {
        DAO.daoName.removeById(request).then((models) => {
            callback(null, models);
        }).catch((error) => {
            callback(error, null);
        });
    },

    removeByCode: function(request, callback) {
        DAO.daoName.removeByCode(request).then((models) => {
            callback(null, models);
        }).catch((error) => {
            callback(error, null);
        });
    },

    update: function(request, callback) {
        Promise.all(DAO.daoName.update(request)).then(function(models) {
            callback(null, models);
        }).catch((error) => {
            callback(error, null);
        });
    },

    saveOrUpdate: function(request, callback) {
        Promise.all(DAO.daoName.saveOrUpdate(request)).then(function(models) {
            callback(null, models);
        }).catch((error) => {
            callback(error, null);
        });
    }
};