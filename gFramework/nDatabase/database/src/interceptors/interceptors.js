/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /*    Sample interceptors, will be removed after test    */
    preGetSample: {
        type: 'schema',
        trigger: 'preGet',
        active: 'true',
        index: 0,
        handler: 'DefaultSampleInterceptorService.handlePreGet'
    },
    postGetSample: {
        type: 'schema',
        trigger: 'postGet',
        active: 'true',
        index: 0,
        handler: 'DefaultSampleInterceptorService.handlePostGet'

    },

    postSaveSample: {
        type: 'schema',
        trigger: 'postSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSampleInterceptorService.handlePostSave'

    },

    preRemoveSample: {
        type: 'schema',
        trigger: 'preRemove',
        active: 'true',
        index: 0,
        handler: 'DefaultSampleInterceptorService.handlePreRemove'

    },

    postRemoveSample: {
        type: 'schema',
        trigger: 'postRemove',
        active: 'true',
        index: 0,
        handler: 'DefaultSampleInterceptorService.handlePostRemove'

    },

    postUpdateSample: {
        type: 'schema',
        trigger: 'postUpdate',
        active: 'true',
        index: 0,
        handler: 'DefaultSampleInterceptorService.handlePostUpdate'

    },
    /*    Sample interceptors, will be removed after test    */

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