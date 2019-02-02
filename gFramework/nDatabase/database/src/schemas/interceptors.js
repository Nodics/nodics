/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        /*    Sample interceptors, will be removed after test    */
        preGetSample: {
            type: 'preGet',
            active: 'true',
            index: 0,
            handler: 'DefaultSampleInterceptorService.handlePreGet'
        },
        postGetSample: {
            type: 'postGet',
            active: 'true',
            index: 0,
            handler: 'DefaultSampleInterceptorService.handlePostGet'

        },

        postSaveSample: {
            type: 'postSave',
            active: 'true',
            index: 0,
            handler: 'DefaultSampleInterceptorService.handlePostSave'

        },

        preRemoveSample: {
            type: 'preRemove',
            active: 'true',
            index: 0,
            handler: 'DefaultSampleInterceptorService.handlePreRemove'

        },

        postRemoveSample: {
            type: 'postRemove',
            active: 'true',
            index: 0,
            handler: 'DefaultSampleInterceptorService.handlePostRemove'

        },

        postUpdateSample: {
            type: 'postUpdate',
            active: 'true',
            index: 0,
            handler: 'DefaultSampleInterceptorService.handlePostUpdate'

        },
        /*    Sample interceptors, will be removed after test    */

        updateModifiedTimeOnSave: {
            type: 'preSave',
            active: 'true',
            index: 0,
            handler: 'DefaultInterceptorService.setUpdatedTimestamp'
        },
        updateModifiedTimeOnUpdate: {
            type: 'preUpdate',
            active: 'true',
            index: 0,
            handler: 'DefaultInterceptorService.setUpdatedTimestamp'
        },
        blockNTestSave: {
            type: 'preSave',
            active: 'true',
            index: 0,
            handler: 'DefaultInterceptorService.blockNTest'
        },
        blockNTestUpdate: {
            type: 'preUpdate',
            active: 'true',
            index: 10,
            handler: 'DefaultInterceptorService.blockNTest'
        }
    }
};