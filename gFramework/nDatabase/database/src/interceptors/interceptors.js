/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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