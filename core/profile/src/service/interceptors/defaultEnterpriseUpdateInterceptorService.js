/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    // Enterprise Save Events
    enterprisePreSave: function (options) {
        return new Promise((resolve, reject) => {
            options.options.returnModified = options.options.returnModified || true;
            options.options.recursive = options.options.recursive || true;
            resolve(true);
        });
    },

    enterprisePreUpdate: function (options) {
        return new Promise((resolve, reject) => {
            options.options.returnModified = options.options.returnModified || true;
            options.options.recursive = options.options.recursive || true;
            resolve(true);
        });
    },
    enterprisePreRemove: function (options) {
        return new Promise((resolve, reject) => {
            options.options.returnModified = options.options.returnModified || true;
            options.options.recursive = options.options.recursive || true;
            resolve(true);
        });
    },

    enterpriseInvalidateAuthToken: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (options.model.code) {
                options.model.tenant = options.model.tenant || options.tenant;
                SERVICE.DefaultAuthenticationService.invalidateEnterpriseAuthToken(options.model).then(success => {
                    this.LOG.debug('Authentication token has been invalidated successfully for Enterprise: ', options.model.code);
                }).catch(error => {
                    this.LOG.error('Failed invalidating authToken for enterprise: ', options.model.code);
                    this.LOG.error(error);
                });
            }
        });
    },

    enterpriseUpdateInvalidateAuthToken: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (options.result && options.result.models && options.result.models.length > 0) {
                options.result.models.forEach(model => {
                    options.model.tenant = options.model.tenant || options.tenant;
                    SERVICE.DefaultAuthenticationService.invalidateEnterpriseAuthToken(model.code).then(success => {
                        this.LOG.debug('Authentication token has been invalidated successfully for Enterprise: ', model.code);
                    }).catch(error => {
                        this.LOG.error('Failed invalidating authToken for enterprise: ', model.code);
                        this.LOG.error(error);
                    });
                });
            }
        });
    },

    enterpriseRemoveInvalidateAuthToken: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (options.result && options.result.models && options.result.models.length > 0) {
                options.result.models.forEach(model => {
                    SERVICE.DefaultAuthenticationService.invalidateEnterpriseAuthToken(model.code, true).then(success => {
                        this.LOG.debug('Authentication token has been invalidated successfully for Enterprise: ', model.code);
                    }).catch(error => {
                        this.LOG.error('Failed invalidating authToken for enterprise: ', model.code);
                        this.LOG.error(error);
                    });
                });
            }
        });
    },

    enterpriseSaveEvent: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            this.triggerEnterpriseUpdateEvent(options.model).then(success => {
                this.LOG.debug('All modules have been informed about Enterprise model changes: ', options.model.code);
            }).catch(error => {
                this.LOG.error('Failed to update modules about Enterprise model changes: ', options.model.code);
                this.LOG.error(error);
            });
        });
    },

    enterpriseUpdateEvent: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (options.result && options.result.models && options.result.models.length > 0) {
                options.result.models.forEach(model => {
                    this.triggerEnterpriseUpdateEvent(options.model).then(success => {
                        this.LOG.debug('All modules have been informed about Enterprise model changes: ', model.code);
                    }).catch(error => {
                        this.LOG.error('Failed to update modules about Enterprise model changes: ', model.code);
                        this.LOG.error(error);
                    });
                });
            }
        });
    },

    enterpriseRemoveEvent: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (options.result && options.result.models && options.result.models.length > 0) {
                options.result.models.forEach(model => {
                    this.triggerEnterpriseUpdateEvent(options.model, true).then(success => {
                        this.LOG.debug('All modules have been informed about Enterprise model changes: ', model.code);
                    }).catch(error => {
                        this.LOG.error('Failed to update modules about Enterprise model changes: ', model.code);
                        this.LOG.error(error);
                    });
                });
            }
        });
    },

    triggerEnterpriseUpdateEvent: function (enterprise, isRemoved) {
        return new Promise((resolve, reject) => {
            let event = {
                enterpriseCode: enterprise.code,
                tenant: enterprise.tenant.code,
                source: 'profile',
                target: 'profile',
                excludeModules: ['profile'],
                state: "NEW",
                type: "SYNC",
                targetType: ENUMS.TargetType.EACH_NODE.key,
                data: {
                    enterprise: enterprise
                }
            };
            if ((isRemoved || !enterprise.active || !enterprise.tenant.active) && NODICS.getTenants().includes(enterprise.tenant.code)) {
                SYSTEM.removeTenants([enterprise.tenant.code]).then(success => {
                    this.LOG.debug('Tenant: ' + enterprise.tenant.code + ' has been successfully deactivated from profile module');
                    event.event = 'removeEnterprise';
                    this.LOG.debug('Pushing event for enterprise removed or deactivated');
                    SERVICE.DefaultEventService.publish(event).then(success => {
                        this.LOG.debug('Event successfully posted');
                        resolve(success);
                    }).catch(error => {
                        this.LOG.error('While posting model change event : ', error);
                        reject(error);
                    });
                }).catch(error => {
                    this.LOG.error('Tenant: ' + enterprise.tenant.code + ' can not be deactivated from profile module');
                    this.LOG.error(error);
                    reject(error);
                });

            } else if (enterprise.active && enterprise.tenant.active && !NODICS.getTenants().includes(enterprise.tenant.code)) {
                SYSTEM.buildEnterprise([enterprise]).then(success => {
                    this.LOG.debug('Enterprise: ' + enterprise.code + ' has been successfully activated within profile module');
                    event.event = 'addEnterprise';
                    this.LOG.debug('Pushing event for enterprise activation');
                    SERVICE.DefaultEventService.publish(event).then(success => {
                        this.LOG.debug('Event successfully posted');
                        resolve(success);
                    }).catch(error => {
                        this.LOG.error('While posting model change event : ', error);
                        reject(error);
                    });
                }).catch(error => {
                    this.LOG.error('Enterprise: ' + enterprise.code + ' can not be activated within profile module');
                    this.LOG.error(error);
                    reject(error);
                });
            } else {
                this.LOG.warn('For enterprise: ' + enterprise.code + ' no action required');
                resolve(true);
            }
        });
    }
};