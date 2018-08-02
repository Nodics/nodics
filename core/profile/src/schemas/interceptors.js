/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        default: {
            /*handleProfileDefaultPreSaveOne: {
                type: 'preSave',
                active: 'true',
                index: 10,
                handler: 'DefaultProfileSaveInterceptorService.handleProfilePreSave'
            },
            handleProfileDefaultPostSaveOne: {
                type: 'postSave',
                active: 'true',
                index: 10,
                handler: 'DefaultProfileSaveInterceptorService.handleProfilePostSave'
            }*/
        },
        password: {
            encryptPassword: {
                type: 'preSave',
                active: 'true',
                index: 0,
                handler: 'DefaultPasswordSaveInterceptorService.encryptPassword'
            },
            /*handlePostSavePassword: {
                type: 'postSave',
                active: 'true',
                index: 0,
                handler: 'DefaultPasswordSaveInterceptorService.handlePostSavePassword'
            },*/
        }
    }
};