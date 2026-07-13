/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/interceptors/interceptors
 * @description Registers profile interceptor wiring for pipeline extension points.
 * @layer interceptors
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    validateUserGroupSave: { type: 'schema', item: 'userGroup', trigger: 'preSave', active: 'true', index: -20, handler: 'DefaultUserGroupGovernanceService.validate' },
    validateUserGroupUpdate: { type: 'schema', item: 'userGroup', trigger: 'preUpdate', active: 'true', index: -20, handler: 'DefaultUserGroupGovernanceService.validate' },
    validateEmployeeSave: { type: 'schema', item: 'employee', trigger: 'preSave', active: 'true', index: -20, handler: 'DefaultPrincipalGovernanceService.validate' },
    validateEmployeeUpdate: { type: 'schema', item: 'employee', trigger: 'preUpdate', active: 'true', index: -20, handler: 'DefaultPrincipalGovernanceService.validate' },
    validateCustomerSave: { type: 'schema', item: 'customer', trigger: 'preSave', active: 'true', index: -20, handler: 'DefaultPrincipalGovernanceService.validate' },
    validateCustomerUpdate: { type: 'schema', item: 'customer', trigger: 'preUpdate', active: 'true', index: -20, handler: 'DefaultPrincipalGovernanceService.validate' },
    prepareEmployeeSecurityStamp: { type: 'schema', item: 'employee', trigger: 'preUpdate', active: 'true', index: -10, handler: 'DefaultPrincipalSecurityStampGovernanceService.preparePrincipalUpdate' },
    registerEmployeeSecurityStamp: { type: 'schema', item: 'employee', trigger: 'postUpdate', active: 'true', index: 10, handler: 'DefaultPrincipalSecurityStampGovernanceService.registerPreparedPrincipalUpdate' },
    prepareCustomerSecurityStamp: { type: 'schema', item: 'customer', trigger: 'preUpdate', active: 'true', index: -10, handler: 'DefaultPrincipalSecurityStampGovernanceService.preparePrincipalUpdate' },
    registerCustomerSecurityStamp: { type: 'schema', item: 'customer', trigger: 'postUpdate', active: 'true', index: 10, handler: 'DefaultPrincipalSecurityStampGovernanceService.registerPreparedPrincipalUpdate' },
    bumpGroupMemberSecurityStamps: { type: 'schema', item: 'userGroup', trigger: 'postUpdate', active: 'true', index: 10, handler: 'DefaultPrincipalSecurityStampGovernanceService.bumpGroupMembers' },
    bumpPasswordOwnerSecurityStamp: { type: 'schema', item: 'password', trigger: 'postUpdate', active: 'true', index: 10, handler: 'DefaultPrincipalSecurityStampGovernanceService.bumpLoginId' },
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
