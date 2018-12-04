/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        enterprise: {
            /*enterprisePreGet: {
                type: 'preSave',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterprisePreGet'
            },*/
            enterprisePreSave: {
                type: 'preSave',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterprisePreSave'
            },
            enterpriseSaveEvent: {
                type: 'postSave',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseSaveEvent'
            },
            enterpriseSaveInvalidateAuthToken: {
                type: 'postSave',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseInvalidateAuthToken'
            },
            enterprisePreUpdate: {
                type: 'preUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterprisePreUpdate'
            },
            enterpriseUpdateEvent: {
                type: 'postUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseUpdateEvent'
            },
            enterpriseUpdateInvalidateAuthToken: {
                type: 'postUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseUpdateInvalidateAuthToken'
            },
            enterprisePreRemove: {
                type: 'preRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterprisePreRemove'
            },
            enterpriseRemoveEvent: {
                type: 'postRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseRemoveEvent'
            },
            enterpriseRemoveInvalidateAuthToken: {
                type: 'postRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseUpdateInvalidateAuthToken'
            },
        },
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
        employee: {
            saveAPIKey: {
                type: 'preSave',
                active: 'true',
                index: 0,
                handler: 'DefaultAPIKeyInterceptorService.generateAPIKey'
            },
            employeeSaveInvalidateAuthToken: {
                type: 'postSave',
                active: 'true',
                index: 0,
                handler: 'DefaultEmployeeUpdateInterceptorService.employeeInvalidateAuthToken'
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
            employeeUpdateInvalidateAuthToken: {
                type: 'postUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultEmployeeUpdateInterceptorService.employeeUpdateInvalidateAuthToken'
            },
            enterprisePreRemove: {
                type: 'preRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultEmployeeUpdateInterceptorService.employeePreRemove'
            },
            employeeRemoveInvalidateAuthToken: {
                type: 'postRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultEmployeeUpdateInterceptorService.employeeUpdateInvalidateAuthToken'
            },

        },
        customer: {
            customerSaveInvalidateAuthToken: {
                type: 'postSave',
                active: 'true',
                index: 0,
                handler: 'DefaultCustomerUpdateInterceptorService.customerInvalidateAuthToken'
            },
            customerPreUpdate: {
                type: 'preUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultCustomerUpdateInterceptorService.customerPreUpdate'
            },
            customerUpdateInvalidateAuthToken: {
                type: 'postUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultCustomerUpdateInterceptorService.customer?UpdateInvalidateAuthToken'
            },
            customerPreRemove: {
                type: 'preRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultCustomerUpdateInterceptorService.customerPreRemove'
            },
            customerRemoveInvalidateAuthToken: {
                type: 'postRemove',
                active: 'true',
                index: 0,
                handler: 'DefaultCustomerUpdateInterceptorService.customer?UpdateInvalidateAuthToken'
            },
        }
    }
};