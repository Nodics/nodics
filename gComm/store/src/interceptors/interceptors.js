/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module store/src/interceptors/interceptors
 * @description Interceptor definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    storePreSave: { type: 'schema', item: 'store', trigger: 'preSave', active: 'true', index: -100,
        handler: 'DefaultStoreFoundationService.prepareStoreSave' },
    storePreGet: { type: 'schema', item: 'store', trigger: 'preGet', active: 'true', index: -100,
        handler: 'DefaultStoreEnterpriseScopeService.scopeQuery' },
    storePreUpdate: { type: 'schema', item: 'store', trigger: 'preUpdate', active: 'true', index: -100,
        handler: 'DefaultStoreFoundationService.prepareStoreUpdate' },
    storePreRemove: { type: 'schema', item: 'store', trigger: 'preRemove', active: 'true', index: -100,
        handler: 'DefaultStoreFoundationService.rejectHardDelete' },
    storeWarehouseAssignmentPreSave: { type: 'schema', item: 'storeWarehouseAssignment', trigger: 'preSave', active: 'true', index: -100,
        handler: 'DefaultStoreWarehouseAssignmentFoundationService.prepareAssignmentSave' },
    storeWarehouseAssignmentPreGet: { type: 'schema', item: 'storeWarehouseAssignment', trigger: 'preGet', active: 'true', index: -100,
        handler: 'DefaultStoreEnterpriseScopeService.scopeQuery' },
    storeWarehouseAssignmentPreUpdate: { type: 'schema', item: 'storeWarehouseAssignment', trigger: 'preUpdate', active: 'true', index: -100,
        handler: 'DefaultStoreWarehouseAssignmentFoundationService.prepareAssignmentUpdate' },
    storeWarehouseAssignmentPreRemove: { type: 'schema', item: 'storeWarehouseAssignment', trigger: 'preRemove', active: 'true', index: -100,
        handler: 'DefaultStoreWarehouseAssignmentFoundationService.rejectHardDelete' }
};
