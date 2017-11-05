/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.get(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.get(inputParam);
        }
    },
    getById: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.getById(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.getById(inputParam);
        }
    },
    getByCode: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.getByCode(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            SERVICE.ServiceName.getByCode(inputParam);
        }
    },
    save: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.save(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.save(inputParam);
        }
    },
    removeById: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.removeById(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.removeById(inputParam);
        }
    },
    removeByCode: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.removeByCode(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.removeByCode(inputParam);
        }
    },
    update: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.update(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.update(inputParam);
        }
    },
    saveOrUpdate: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.saveOrUpdate(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.saveOrUpdate(inputParam);
        }
    }
};