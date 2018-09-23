/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        updateModifiedTimeOnSave: {
            type: 'preSave',
            active: 'true',
            index: 0,
            handler: 'DefaultSaveInterceptorService.setUpdatedTimestamp'
        },
        updateModifiedTimeOnUpdate: {
            type: 'preUpdate',
            active: 'true',
            index: 0,
            handler: 'DefaultSaveInterceptorService.setUpdatedTimestamp'
        },
        blockNTestSave: {
            type: 'preSave',
            active: 'true',
            index: 0,
            handler: 'DefaultSaveInterceptorService.blockNTestSave'
        },
        blockNTestUpdate: {
            type: 'preUpdate',
            active: 'true',
            index: 10,
            handler: 'DefaultSaveInterceptorService.blockNTestUpdate'
        },

        publishModifiedBySaveEvent: {
            type: 'postSave',
            active: 'true',
            index: 0,
            handler: 'DefaultSaveInterceptorService.publishModifiedEvent'
        },
        publishModifiedByUpdateEvent: {
            type: 'postUpdate',
            active: 'true',
            index: 0,
            handler: 'DefaultSaveInterceptorService.publishModifiedEvent'
        }

        /* -------------------------------------------------------------- 

        samplePreSave: {
            type: 'preSave',
            active: 'true',
            index: 10,
            handler: 'DefaultSaveSampleInterceptorService.handlePreSave'
        },
        handlePreSaveOne: {
            type: 'preSave',
            active: 'true',
            index: 10,
            handler: 'DefaultSaveSampleInterceptorService.handlePreSaveOne'
        },
        handlePostSave: {
            type: 'postSave',
            active: 'true',
            index: 10,
            handler: 'DefaultSaveSampleInterceptorService.handlePostSave'
        },
        handlePostSaveOne: {
            type: 'postSave',
            active: 'true',
            index: 10,
            handler: 'DefaultSaveSampleInterceptorService.handlePostSaveOne'
        },

        samplePreGet: {
            type: 'preGet',
            active: 'true',
            index: 10,
            handler: 'DefaultGetSampleInterceptorService.handlePreGet'
        },
        handlePreGetOne: {
            type: 'preGet',
            active: 'true',
            index: 10,
            handler: 'DefaultGetSampleInterceptorService.handlePreGetOne'
        },
        handlePostGet: {
            type: 'postGet',
            active: 'true',
            index: 10,
            handler: 'DefaultGetSampleInterceptorService.handlePostGet'
        },
        handlePostGetOne: {
            type: 'postGet',
            active: 'true',
            index: 10,
            handler: 'DefaultGetSampleInterceptorService.handlePostGetOne'
        }

        */
    }
};