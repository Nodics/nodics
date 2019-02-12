/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    customerPreUpdate: function (request, responce) {
        return new Promise((resolve, reject) => {
            request.request.returnModified = request.request.returnModified || true;
            resolve(true);
        });
    },
    customerPreRemove: function (request, responce) {
        return new Promise((resolve, reject) => {
            request.request.returnModified = request.request.returnModified || true;
            resolve(true);
        });
    },

    customerInvalidateAuthToken: function (request, responce) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (request.model && request.model.loginId) {
                request.model.tenant = request.model.tenant || request.tenant;
                SERVICE.DefaultAuthenticationService.invalidateCustomerAuthToken(request.model).then(success => {
                    this.LOG.debug('Authentication token has been invalidated successfully for Customer: ', request.model.loginId);
                }).catch(error => {
                    this.LOG.error('Failed invalidating authToken for Customer: ', request.model.loginId);
                    this.LOG.error(error);
                });
            }
        });
    },
    customerUpdateInvalidateAuthToken: function (request, responce) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (request.result && request.result.models && request.result.models.length > 0) {
                request.result.models.forEach(model => {
                    model.tenant = model.tenant || request.tenant;
                    SERVICE.DefaultAuthenticationService.invalidateCustomerAuthToken(model).then(success => {
                        this.LOG.debug('Authentication token has been invalidated successfully for Customer: ', model.loginId);
                    }).catch(error => {
                        this.LOG.error('Failed invalidating authToken for Customer: ', model.loginId);
                        this.LOG.error(error);
                    });
                });
            }
        });
    },

};