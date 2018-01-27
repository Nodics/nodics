/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    get: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant,
            enterpriseCode: requestContext.enterpriseCode
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
        let request = {
            tenant: requestContext.tenant,
            enterpriseCode: requestContext.enterpriseCode
        };
        if (requestContext.httpRequest) {
            request.id = requestContext.httpRequest.params.id;
            FACADE.FacadeName.getById(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
        }
    },

    save: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant,
            enterpriseCode: requestContext.enterpriseCode
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
        let request = {
            ids: [],
            tenant: requestContext.tenant,
            enterpriseCode: requestContext.enterpriseCode
        };
        if (requestContext.httpRequest.req.params.id) {
            request.ids.push(requestContext.httpRequest.req.params.id);
        } else {
            request.ids = requestContext.httpRequest.req.body;
        }
        FACADE.FacadeName.removeById(request, callback);
    },

    update: function(requestContext, callback) {
        let request = {
            models: [],
            tenant: requestContext.tenant,
            enterpriseCode: requestContext.enterpriseCode
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
        let request = {
            models: [],
            tenant: requestContext.tenant,
            enterpriseCode: requestContext.enterpriseCode
        };
        if (requestContext.httpRequest) {
            if (!UTILS.isBlank(requestContext.httpRequest.body)) {
                if (_.isArray(requestContext.httpRequest.body)) {
                    request.models = requestContext.httpRequest.body;
                } else {
                    request.models.push(requestContext.httpRequest.body);
                }
            }
            FACADE.FacadeName.saveOrUpdate(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
        }

    }
};