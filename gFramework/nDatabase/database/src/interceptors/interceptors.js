/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/interceptors/DatabaseInterceptors
 * @description Default schema interceptor registry for generated database CRUD
 * flows. These definitions attach timestamp mutation and nTest write guards to
 * schema save/update lifecycle triggers.
 * @layer interceptor
 * @owner nDatabase
 * @override Project modules may override or extend interceptor definitions by
 * layering later interceptor files, changing index/order, active state, or
 * handler implementations.
 *
 * @property {Object} updateModifiedTimeOnSave preSave timestamp interceptor.
 * @property {Object} updateModifiedTimeOnUpdate preUpdate timestamp interceptor.
 * @property {Object} blockNTestSave preSave nTest guard.
 * @property {Object} blockNTestUpdate preUpdate nTest guard.
 */
module.exports = {
    updateModifiedTimeOnSave: {
        type: 'schema',
        trigger: 'preSave',
        active: 'true',
        index: 10,
        handler: 'DefaultInterceptorService.setUpdatedTimestamp'
    },
    updateModifiedTimeOnUpdate: {
        type: 'schema',
        trigger: 'preUpdate',
        active: 'true',
        index: 0,
        handler: 'DefaultInterceptorService.setUpdatedTimestamp'
    },
    blockNTestSave: {
        type: 'schema',
        trigger: 'preSave',
        active: 'true',
        index: 5,
        handler: 'DefaultInterceptorService.blockNTest'
    },
    blockNTestUpdate: {
        type: 'schema',
        trigger: 'preUpdate',
        active: 'true',
        index: 10,
        handler: 'DefaultInterceptorService.blockNTest'
    }
};
