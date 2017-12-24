/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    get: function(requestContext, callback) {
        console.log(' ------------------- Get');
        let request = {
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest) {
            if (!UTILS.isBlank(requestContext.httpRequest.body)) {
                request.options = requestContext.httpRequest.body;
            } else {
                request.options = {};
            }
            FACADE.FacadeName.get(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
        }
    },

    getById: function(requestContext, callback) {
        console.log(' ------------------- GetById');
        let request = {
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest) {
            request.id = requestContext.httpRequest.params.id;
            FACADE.FacadeName.getById(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
        }
    },

    getByCode: function(requestContext, callback) {
        console.log(' ------------------- GetByCode');
        let request = {
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest) {
            request.code = requestContext.httpRequest.params.code;
            FACADE.FacadeName.getByCode(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
        }
    },

    save: function(requestContext, callback) {
        console.log(' ------------------- GetSave');
        let request = {
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest &&
            requestContext.httpRequest &&
            !UTILS.isBlank(requestContext.httpRequest.body)) {
            request.models = requestContext.httpRequest.body;
            FACADE.FacadeName.save(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            throw new Error('ERROR: Please validate your request, it is not a valid one');
        }

    },

    removeById: function(requestContext, callback) {
        console.log(' ------------------- GetRemoveId');
        let request = {
            ids: [],
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest.req.params.id) {
            request.ids.push(requestContext.httpRequest.req.params.id);
        } else {
            request.ids = requestContext.httpRequest.req.body;
        }
        FACADE.FacadeName.removeById(request, callback);
    },

    removeByCode: function(requestContext, callback) {
        console.log(' ------------------- GetremoveCode');
        let request = {
            codes: [],
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest) {
            if (requestContext.httpRequest.req.params.code) {
                request.codes.push(requestContext.httpRequest.req.params.code);
            } else {
                request.codes = requestContext.httpRequest.req.body;
            }
            FACADE.FacadeName.removeByCode(request, output);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
        }

    },

    update: function(requestContext, callback) {
        console.log(' ------------------- Update');
        let request = {
            models: [],
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest) {
            if (!UTILS.isBlank(requestContext.httpRequest.body)) {
                if (_.isArray(requestContext.httpRequest.body)) {
                    request.models = requestContext.httpRequest.body;
                } else {
                    request.models.push(requestContext.httpRequest.body);
                }
            }
            FACADE.FacadeName.update(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
        }

    },
    saveOrUpdate: function(requestContext, callback) {
        console.log(' ------------------- SaveUpdate');
        let request = {
            models: [],
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest) {
            if (!UTILS.isBlank(requestContext.httpRequest.body)) {
                if (_.isArray(requestContext.httpRequest.body)) {
                    request.models = requestContext.httpRequest.body;
                } else {
                    request.models.push(requestContext.httpRequest.body);
                }
            }
            FACADE.FacadeName.saveOrUpdate(reqest, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
        }

    }
};