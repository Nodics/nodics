/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function(input, output, callback) {
        if (callback) {
            return SERVICE.ServiceName.get(input, output, (error, models, input, output) => {
                callback(error, models, input, output);
            });
        } else {
            return SERVICE.ServiceName.get(input, output);
        }
    },
    getById: function(input, output, callback) {
        if (callback) {
            return SERVICE.ServiceName.getById(inputParam, (error, models, input, output) => {
                callback(error, models, input, output);
            });
        } else {
            return SERVICE.ServiceName.getById(input, output);
        }
    },
    getByCode: function(input, output, callback) {
        if (callback) {
            return SERVICE.ServiceName.getByCode(input, output, (error, models, input, output) => {
                callback(error, models, input, output);
            });
        } else {
            SERVICE.ServiceName.getByCode(input, output);
        }
    },
    save: function(input, output, callback) {
        if (callback) {
            return SERVICE.ServiceName.save(input, output, (error, models, input, output) => {
                callback(error, models, input, output);
            });
        } else {
            return SERVICE.ServiceName.save(input, output);
        }
    },
    removeById: function(input, output, callback) {
        if (callback) {
            return SERVICE.ServiceName.removeById(input, output, (error, models, input, output) => {
                callback(error, models, input, output);
            });
        } else {
            return SERVICE.ServiceName.removeById(input, output);
        }
    },
    removeByCode: function(input, output, callback) {
        if (callback) {
            return SERVICE.ServiceName.removeByCode(input, output, (error, models, input, output) => {
                callback(error, models, input, output);
            });
        } else {
            return SERVICE.ServiceName.removeByCode(input, output);
        }
    },
    update: function(input, output, callback) {
        if (callback) {
            return SERVICE.ServiceName.update(inputParam, (error, models, input, output) => {
                callback(error, models, input, output);
            });
        } else {
            return SERVICE.ServiceName.update(input, output);
        }
    },
    saveOrUpdate: function(input, output, callback) {
        if (callback) {
            return SERVICE.ServiceName.saveOrUpdate(inputParam, (error, models, input, output) => {
                callback(error, models, input, output);
            });
        } else {
            return SERVICE.ServiceName.saveOrUpdate(input, output);
        }
    }
};