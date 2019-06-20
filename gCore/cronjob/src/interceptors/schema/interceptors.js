/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    cronJob: {
        preSaveCheckActiveValue: {
            type: 'preSave',
            active: 'true',
            index: 0,
            handler: 'DefaultActiveValuesCheckInterceptorService.convertToDate'
        },
        preUpdateCheckActiveValue: {
            type: 'preUpdate',
            active: 'true',
            index: 0,
            handler: 'DefaultActiveValuesCheckInterceptorService.convertToDate'
        },
        postSaveStartJob: {
            type: 'postSave',
            active: 'true',
            index: 9999999,
            handler: 'DefaultJobActivatorInterceptorService.activateJob'
        }
    }
};