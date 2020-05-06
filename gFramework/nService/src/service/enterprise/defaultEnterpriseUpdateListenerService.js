/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    handleAddEnterprise: function (event, callback, request) {
        if (event.data.enterprise) {
            let enterprise = event.data.enterprise;
            if (enterprise.tenant && enterprise.tenant.code) {
                if (!NODICS.getActiveTenants().includes(enterprise.tenant.code)) {
                    SERVICE.DefaultEnterpriseHandlerService.buildEnterprise([enterprise]).then(success => {
                        this.LOG.debug('Enterprise: ' + enterprise.code + ' has been successfully activated');
                        callback(null, {
                            success: true,
                            code: 'SUC_SYS_00000',
                            message: 'Successfully updated enterprise'
                        });
                    }).catch(error => {
                        this.LOG.error('Enterprise: ' + enterprise.code + ' can not be activated');
                        this.LOG.error(error);
                        callback({
                            success: false,
                            code: 'ERR_EVNT_00000',
                            error: error.toString()
                        });
                    });
                } else {
                    this.LOG.debug('Enterprise: ' + enterprise.code + ' is already activated');
                    callback(null, {
                        success: true,
                        code: 'SUC_SYS_00000',
                        message: 'Successfully updated enterprise'
                    });
                }
            } else {
                this.LOG.error('Enterprise model dont have tenant associated or wrong tenant object');
                callback({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    message: 'Enterprise model dont have tenant associated or wrong tenant object'
                });
            }
        } else {
            this.LOG.error('Invalid enterprise model value');
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                message: 'Invalid enterprise model value'
            });
        }
    },

    handleRemoveEnterprise: function (event, callback, request) {
        if (event.data.enterprise) {
            let enterprise = event.data.enterprise;
            if (enterprise.tenant && enterprise.tenant.code) {
                if (NODICS.getActiveTenants().includes(enterprise.tenant.code)) {
                    SERVICE.DefaultTenantHandlerService.removeTenants([enterprise.tenant.code]).then(success => {
                        NODICS.removeInternalAuthToken(enterprise.tenant.code);
                        this.LOG.debug('Tenant: ' + enterprise.tenant.code + ' has been successfully deactivated');
                        callback(null, {
                            success: true,
                            code: 'SUC_SYS_00000',
                            message: 'Successfully updated enterprise'
                        });
                    }).catch(error => {
                        this.LOG.error('Tenant: ' + enterprise.tenant.code + ' can not be deactivated');
                        this.LOG.error(error);
                        callback({
                            success: false,
                            code: 'ERR_EVNT_00000',
                            error: error.toString()
                        });
                    });
                } else {
                    this.LOG.debug('Enterprise: ' + enterprise.code + ' is already deactivated');
                    callback(null, {
                        success: true,
                        code: 'SUC_SYS_00000',
                        message: 'Successfully updated enterprise'
                    });
                }
            } else {
                this.LOG.error('Enterprise model dont have tenant associated or wrong tenant object');
                callback({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    message: 'Enterprise model dont have tenant associated or wrong tenant object'
                });
            }
        } else {
            this.LOG.error('Invalid enterprise model value');
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                message: 'Invalid enterprise model value'
            });
        }
    },
};