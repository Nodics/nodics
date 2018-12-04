/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    customerPreUpdate: function (options) {
        return new Promise((resolve, reject) => {
            options.options.returnModified = options.options.returnModified || true;
            resolve(true);
        });
    },
    customerPreRemove: function (options) {
        return new Promise((resolve, reject) => {
            options.options.returnModified = options.options.returnModified || true;
            resolve(true);
        });
    },

    customerInvalidateAuthToken: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (options.model && options.model.loginId) {
                SERVICE.DefaultAuthenticationService.invalidateCustomerAuthToken(options.model.loginId).then(success => {
                    this.LOG.debug('Authentication token has been invalidated successfully for Customer: ', options.model.loginId);
                }).catch(error => {
                    this.LOG.error('Failed invalidating authToken for Customer: ', options.model.loginId);
                    this.LOG.error(error);
                });
            }
        });
    },
    customerUpdateInvalidateAuthToken: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (options.result && options.result.models && options.result.models.length > 0) {
                options.result.models.forEach(model => {
                    SERVICE.DefaultAuthenticationService.invalidateCustomerAuthToken(model.loginId).then(success => {
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