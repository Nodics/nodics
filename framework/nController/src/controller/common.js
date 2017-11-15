/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    moduleName: 'mdulName',

    get: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest) {
            if (!SYSTEM.isBlank(requestContext.httpRequest.body)) {
                request.options = requestContext.httpRequest.body;
            } else {
                request.options = {};
            }
        }
        FACADE.FacadeName.get(request, callback);
    },

    getById: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant
        };
        if (input.httpRequest) {
            request.id = requestContext.httpRequest.params.id;
        }
        FACADE.FacadeName.getById(request, callback);
    },

    getByCode: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant
        };
        if (input.httpRequest) {
            request.code = requestContext.httpRequest.params.code;
        }
        FACADE.FacadeName.getByCode(request, callback);
    },

    save: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest &&
            requestContext.httpRequest.req &&
            !SYSTEM.isBlank(requestContext.httpRequest.req.body)) {
            request.models = requestContext.httpRequest.req.body;
        }
        FACADE.FacadeName.save(request, callback);
    },

    removeById: function(requestContext, callback) {
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
        let request = {
            codes: [],
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest.req.params.code) {
            request.codes.push(requestContext.httpRequest.req.params.code);
        } else {
            request.codes = requestContext.httpRequest.req.body;
        }
        FACADE.FacadeName.removeByCode(input, output);
    },

    update: function(requestContext, callback) {
        let request = {
            models: [],
            tenant: requestContext.tenant
        };
        if (!SYSTEM.isBlank(requestContext.httpRequest.body)) {
            if (_.isArray(requestContext.httpRequest.body)) {
                request.models = requestContext.httpRequest.body;
            } else {
                request.models.push(requestContext.httpRequest.body);
            }
        }
        FACADE.FacadeName.update(request, callback);
    },
    saveOrUpdate: function(requestContext, callback) {
        let request = {
            models: [],
            tenant: requestContext.tenant
        };
        if (!SYSTEM.isBlank(requestContext.httpRequest.body)) {
            if (_.isArray(requestContext.httpRequest.body)) {
                request.models = requestContext.httpRequest.body;
            } else {
                request.models.push(requestContext.httpRequest.body);
            }
        }
        FACADE.FacadeName.saveOrUpdate(reqest, callback);
    }
}