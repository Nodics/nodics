/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    // Enterprise Save Events
    enterprisePreSave: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options.returnModified = request.options.returnModified || true;
            request.options.recursive = request.options.recursive || true;
            resolve(true);
        });
    },

    enterprisePreUpdate: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options.returnModified = request.options.returnModified || true;
            request.options.recursive = request.options.recursive || true;
            resolve(true);
        });
    },
    enterprisePreRemove: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options.returnModified = request.options.returnModified || true;
            request.options.recursive = request.options.recursive || true;
            resolve(true);
        });
    },

    enterpriseSaveEvent: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
            this.triggerEnterpriseUpdateEvent(request.model).then(success => {
                this.LOG.debug('All modules have been informed about Enterprise model changes: ' + request.model.code);
            }).catch(error => {
                this.LOG.error('Failed to update modules about Enterprise model changes: ' + request.model.code);
                this.LOG.error(error);
            });
        });
    },

    enterpriseUpdateEvent: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (request.result && request.result.models && request.result.models.length > 0) {
                request.result.models.forEach(model => {
                    this.triggerEnterpriseUpdateEvent(model).then(success => {
                        this.LOG.debug('All modules have been informed about Enterprise model changes: ' + model.code);
                    }).catch(error => {
                        this.LOG.error('Failed to update modules about Enterprise model changes: ' + model.code);
                        this.LOG.error(error);
                    });
                });
            }
        });
    },

    enterpriseRemoveEvent: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (request.result && request.result.models && request.result.models.length > 0) {
                request.result.models.forEach(model => {
                    this.triggerEnterpriseUpdateEvent(model, true).then(success => {
                        this.LOG.debug('All modules have been informed about Enterprise model changes: ' + model.code);
                    }).catch(error => {
                        this.LOG.error('Failed to update modules about Enterprise model changes: ' + model.code);
                        this.LOG.error(error);
                    });
                });
            }
        });
    },

    triggerEnterpriseUpdateEvent: function (enterprise, isRemoved) {
        return new Promise((resolve, reject) => {
            let event = {
                tenant: 'default',
                sourceName: 'profile',
                sourceId: CONFIG.get('nodeId'),
                target: 'profile',
                state: "NEW",
                type: "SYNC",
                active: true,
                targetType: ENUMS.TargetType.MODULE_NODES.key,
                data: {
                    enterprise: enterprise
                }
            };
            if ((isRemoved || !enterprise.active || !enterprise.tenant.active) && NODICS.getActiveTenants().includes(enterprise.tenant.code)) {
                SERVICE.DefaultEnterpriseService.get({
                    tenant: 'default',
                    query: {
                        tenant: enterprise.tenant.code,
                        active: true
                    }
                }).then(success => {
                    if (!success.result || success.result.length <= 0) {
                        SERVICE.DefaultTenantHandlerService.removeTenants([enterprise.tenant.code]).then(success => {
                            NODICS.removeInternalAuthToken(enterprise.tenant.code);
                            NODICS.removeActiveEnterprise(enterprise.code);
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
                    } else {
                        this.LOG.debug('Tenant: ' + enterprise.tenant.code + ' is already being used with other enterprises as well');
                        resolve(success);
                    }
                }).catch(error => {
                    this.LOG.error('Failed to check if current tenant is associated with other active enterprises as well : ', error);
                    reject(error);
                });
            } else if (enterprise.active && enterprise.tenant.active && !NODICS.getActiveTenants().includes(enterprise.tenant.code)) {
                SERVICE.DefaultEnterpriseHandlerService.buildEnterprise([enterprise]).then(success => {
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