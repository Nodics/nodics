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
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    getById: function(request, callback) {
        DAO.daoName.getById(request).then((models) => {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    getByCode: function(request, callback) {
        DAO.daoName.getByCode(request).then((models) => {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    save: function(request, callback) {
        DAO.daoName.save(request).then((models) => {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    removeById: function(request, callback) {
        DAO.daoName.removeById(request).then((models) => {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    removeByCode: function(request, callback) {
        DAO.daoName.removeByCode(request).then((models) => {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    update: function(request, callback) {
        console.log('    1111111 3333333333--------------- : ', request);
        Promise.all(DAO.daoName.update(request)).then(function(models) {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    },

    saveOrUpdate: function(request, callback) {
        Promise.all(DAO.daoName.saveOrUpdate(request)).then(function(models) {
            callback(null, models, request);
        }).catch((error) => {
            callback(error, null, request);
        });
    }
};