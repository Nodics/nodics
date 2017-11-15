/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    /* handleResponse: function(error, success, httpRequest, httpResponse, callback) {
         let response = {};
         if (error) {
             response.success = false;
             response.code = 'ERR001';
             response.msg = error;
         } else {
             response.success = true;
             response.code = 'SUC001';
             response.msg = 'Finished Successfully';
             response.result = success;
         }
         if (callback) {
             callback(response, httpRequest, httpResponse);
         } else {
             inputParam.res.json(response);
         }
     },*/
    get: function(input, output, callback) {
        let request = {
            tenant: input.tenant
        };
        if (input.httpRequest) {
            request = {
                options: input.httpRequest.body
            };
        }
        DAO.daoName.get(request).then((models) => {
            callback(null, models, input, output);
        }).catch((error) => {
            callback(error, null, input, output);
        });
    },
    getById: function(input, output, callback) {
        let request = {
            tenant: input.tenant
        };
        if (input.httpRequest) {
            request.id = input.httpRequest.params.id;
        } else {
            request.id = input.id;
        }
        DAO.daoName.getById(request).then((models) => {
            callback(null, models, input, output);
        }).catch((error) => {
            callback(error, null, input, output);
        });
    },
    getByCode: function(input, output, callback) {
        let request = {
            tenant: input.tenant
        };
        if (input.httpRequest) {
            request.code = input.httpRequest.params.code;
        } else {
            request.id = input.code;
        }
        DAO.daoName.getByCode(request).then((models) => {
            callback(null, models, input, output);
        }).catch((error) => {
            callback(error, null, input, output);
        });
    },

    save: function(input, output, callback) {
        let request = {
            tenant: input.tenant
        };
        if (input.httpRequest && input.httpRequest.req && !_.isEmpty(input.httpRequest.req.body)) {
            request.models = input.httpRequest.req.body;
        } else {
            request.models = input.models;
        }
        DAO.daoName.save(request).then((models) => {
            callback(null, models, input, output);
        }).catch((error) => {
            callback(error, null, input, output);
        });
    },

    removeById: function(input, output, callback) {
        let request = {
            ids: [],
            tenant: input.tenant
        };
        if (input.ids) {
            request.ids = input.ids;
        } else if (input.httpRequest.req.params.id) {
            request.ids.push(input.httpRequest.req.params.id);
        } else {
            request.ids = input.httpRequest.req.body;
        }
        DAO.daoName.removeById(request).then((models) => {
            callback(null, models, input, output);
        }).catch((error) => {
            callback(error, null, input, output);
        });
    },

    removeByCode: function(input, output, callback) {
        let request = {
            codes: [],
            tenant: input.tenant
        };
        if (input.codes) {
            request.codes = input.codes;
        } else if (input.httpRequest.req.params.code) {
            request.codes.push(input.httpRequest.req.params.code);
        } else {
            request.codes = input.httpRequest.req.body;
        }
        DAO.daoName.removeByCode(request).then((models) => {
            callback(null, models, input, output);
        }).catch((error) => {
            callback(error, null, input, output);
        });
    },

    update: function(input, output, callback) {
        let request = {
            models: [],
            tenant: input.tenant
        };
        if (input.models) {
            request.models = input.models;
        } else if (SYSTEM.isBlank(input.httpRequest.body)) {
            if (_.isArray(input.httpRequest.body)) {
                request.models = input.httpRequest.body;
            } else {
                request.models.push(input.httpRequest.body);
            }
        }
        Promise.all(DAO.daoName.update(request)).then(function(models) {
            callback(null, models, input, output);
        }).catch((error) => {
            callback(error, null, input, output);
        });
    },

    saveOrUpdate: function(input, output, callback) {
        let request = {
            models: [],
            tenant: input.tenant
        };
        if (input.models) {
            request.models = input.models;
        } else if (SYSTEM.isBlank(input.httpRequest.body)) {
            if (_.isArray(input.httpRequest.body)) {
                request.models = input.httpRequest.body;
            } else {
                request.models.push(input.httpRequest.body);
            }
        }
        Promise.all(DAO.daoName.saveOrUpdate(request)).then(function(models) {
            callback(null, models, input, output);
        }).catch((error) => {
            callback(error, null, input, output);
        });
    }
};