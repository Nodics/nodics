/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    encryptSavePassword: {
        type: 'schema',
        item: 'password',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultPasswordSaveInterceptorService.encryptPassword'
    },
    encryptUpdatePassword: {
        type: 'schema',
        item: 'password',
        trigger: 'preUpdate',
        active: 'true',
        index: 0,
        handler: 'DefaultPasswordSaveInterceptorService.encryptPassword'
    },

    customerPreUpdate: {
        type: 'schema',
        item: 'customer',
        trigger: 'preUpdate',
        active: 'true',
        index: 0,
        handler: 'DefaultCustomerUpdateInterceptorService.customerPreUpdate'
    },
    customerPreRemove: {
        type: 'schema',
        item: 'customer',
        trigger: 'preRemove',
        active: 'true',
        index: 0,
        handler: 'DefaultCustomerUpdateInterceptorService.customerPreRemove'
    },

    saveAPIKey: {
        type: 'schema',
        item: 'employee',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultAPIKeyInterceptorService.generateAPIKey'
    },
    updateAPIKey: {
        type: 'schema',
        item: 'employee',
        trigger: 'preUpdate',
        active: 'true',
        index: 0,
        handler: 'DefaultAPIKeyInterceptorService.generateAPIKey'
    },
    employeePreUpdate: {
        type: 'schema',
        item: 'employee',
        trigger: 'preUpdate',
        active: 'true',
        index: 0,
        handler: 'DefaultEmployeeUpdateInterceptorService.employeePreUpdate'
    },
    employeePreRemove: {
        type: 'schema',
        item: 'employee',
        trigger: 'preRemove',
        active: 'true',
        index: 0,
        handler: 'DefaultEmployeeUpdateInterceptorService.employeePreRemove'
    },
    employeeGetRecursice: {
        type: 'schema',
        item: 'employee',
        trigger: 'preGet',
        active: 'true',
        index: 0,
        handler: 'DefaultEmployeeGetInterceptorService.getEmployeeRecursive'
    },
    employeeUserGroupCodes: {
        type: 'schema',
        item: 'employee',
        trigger: 'postGet',
        active: 'true',
        index: 0,
        handler: 'DefaultEmployeeGetInterceptorService.getAllUserGroupCodes'
    },
    customerGetRecursice: {
        type: 'schema',
        item: 'customer',
        trigger: 'preGet',
        active: 'true',
        index: 0,
        handler: 'DefaultCustomerGetInterceptorService.getCustomerRecursive'
    },
    customerUserGroupCodes: {
        type: 'schema',
        item: 'customer',
        trigger: 'postGet',
        active: 'true',
        index: 0,
        handler: 'DefaultCustomerGetInterceptorService.getAllUserGroupCodes'
    },
    enterprisePreSave: {
        type: 'schema',
        item: 'enterprise',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultEnterpriseUpdateInterceptorService.enterprisePreSave'
    },
    enterprisePreUpdate: {
        type: 'schema',
        item: 'enterprise',
        trigger: 'preUpdate',
        active: 'true',
        index: 0,
        handler: 'DefaultEnterpriseUpdateInterceptorService.enterprisePreUpdate'
    },
    enterprisePreRemove: {
        type: 'schema',
        item: 'enterprise',
        trigger: 'preRemove',
        active: 'true',
        index: 0,
        handler: 'DefaultEnterpriseUpdateInterceptorService.enterprisePreRemove'
    },
    enterpriseSaveEvent: {
        type: 'schema',
        item: 'enterprise',
        trigger: 'postSave',
        active: 'true',
        index: 0,
        handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseSaveEvent'
    },
    enterpriseUpdateEvent: {
        type: 'schema',
        item: 'enterprise',
        trigger: 'postUpdate',
        active: 'true',
        index: 0,
        handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseUpdateEvent'
    },
    enterpriseRemoveEvent: {
        type: 'schema',
        item: 'enterprise',
        trigger: 'postRemove',
        active: 'true',
        index: 0,
        handler: 'DefaultEnterpriseUpdateInterceptorService.enterpriseRemoveEvent'
    },
    customerLoginIdValidator: {
        type: 'schema',
        item: 'customer',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultCustomerLoginIdInterceptorService.validateLoginId'
    },
};