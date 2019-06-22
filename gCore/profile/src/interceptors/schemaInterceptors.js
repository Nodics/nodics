/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        password: {
            encryptSavePassword: {
                type: 'preSave',
                active: 'true',
                index: 0,
                handler: 'DefaultPasswordSaveInterceptorService.encryptPassword'
            },
            encryptUpdatePassword: {
                type: 'preUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultPasswordSaveInterceptorService.encryptPassword'
            }
        },

        customer: {
            customerPreUpdate: {
                type: 'preUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultCustomerUpdateInterceptorService.customerPreUpdate'
            },
            customerPreRemove: {
                type: 'preRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultCustomerUpdateInterceptorService.customerPreRemove'
            }
        },

        employee: {
            saveAPIKey: {
                type: 'preSave',
                active: 'true',
                index: 0,
                handler: 'DefaultAPIKeyInterceptorService.generateAPIKey'
            },

            updateAPIKey: {
                type: 'preUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultAPIKeyInterceptorService.generateAPIKey'
            },

            employeePreUpdate: {
                type: 'preUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultEmployeeUpdateInterceptorService.employeePreUpdate'
            },

            enterprisePreRemove: {
                type: 'preRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultEmployeeUpdateInterceptorService.employeePreRemove'
            }
        },

        enterprise: {
            enterprisePreSave: {
                type: 'preSave',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterprisePreSave'
            },
            enterprisePreUpdate: {
                type: 'preUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterprisePreUpdate'
            },
            enterprisePreRemove: {
                type: 'preRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterprisePreRemove'
            },
            enterpriseSaveEvent: {
                type: 'postSave',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseSaveEvent'
            },
            enterpriseUpdateEvent: {
                type: 'postUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseUpdateEvent'
            },
            enterpriseRemoveEvent: {
                type: 'postRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseRemoveEvent'
            }
        }
    }
};