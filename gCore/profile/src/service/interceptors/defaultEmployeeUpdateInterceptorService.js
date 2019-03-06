/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    employeePreUpdate: function (request, responce) {
        return new Promise((resolve, reject) => {
            request.options.returnModified = request.options.returnModified || true;
            resolve(true);
        });
    },
    employeePreRemove: function (request, responce) {
        return new Promise((resolve, reject) => {
            request.options.returnModified = request.options.returnModified || true;
            resolve(true);
        });
    },

    employeeInvalidateAuthToken: function (request, responce) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (request.model && request.model.loginId) {
                request.model.tenant = request.model.tenant || request.tenant;
                SERVICE.DefaultAuthenticationService.invalidateEmployeeAuthToken(request.model).then(success => {
                    this.LOG.debug('Authentication token has been invalidated successfully for Employee: ', request.model.loginId);
                }).catch(error => {
                    this.LOG.error('Failed invalidating authToken for Employee: ', request.model.loginId);
                    this.LOG.error(error);
                });
            }
        });
    },

    employeeUpdateInvalidateAuthToken: function (request, responce) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (request.result && request.result.models && request.result.models.length > 0) {
                request.result.models.forEach(model => {
                    model.tenant = model.tenant || request.tenant;
                    SERVICE.DefaultAuthenticationService.invalidateEmployeeAuthToken(model).then(success => {
                        this.LOG.debug('Authentication token has been invalidated successfully for Employee: ', model.loginId);
                    }).catch(error => {
                        this.LOG.error('Failed invalidating authToken for Employee: ', model.loginId);
                        this.LOG.error(error);
                    });
                });
            }
        });
    },

    employeeRemoveInvalidateAuthToken: function (request, responce) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (request.result && request.result.models && request.result.models.length > 0) {
                request.result.models.forEach(model => {
                    model.tenant = model.tenant || request.tenant;
                    SERVICE.DefaultAuthenticationService.invalidateEmployeeAuthToken(model, true).then(success => {
                        this.LOG.debug('Authentication token has been invalidated successfully for Employee: ', model.loginId);
                    }).catch(error => {
                        this.LOG.error('Failed invalidating authToken for Employee: ', model.loginId);
                        this.LOG.error(error);
                    });
                });
            }
        });
    },

};