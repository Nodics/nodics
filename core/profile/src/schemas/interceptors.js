/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        password: {
            encryptSavePassword: {
                type: 'preSave',
                active: 'true',
                index: 0,
                handler: 'DefaultPasswordSaveInterceptorService.encryptPassword'
            },
            encryptUpdatePassword: {
                type: 'preUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultPasswordSaveInterceptorService.encryptPassword'
            }
        },
        employee: {
            saveAPIKey: {
                type: 'preSave',
                active: 'true',
                index: 0,
                handler: 'DefaultAPIKeyInterceptorService.generateAPIKey'
            },
            updateAPIKey: {
                type: 'preUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultAPIKeyInterceptorService.generateAPIKey'
            }
        },
        /*customer: {
            encryptSavePassword: {
                type: 'preSave',
                active: 'true',
                index: 0,
                handler: 'DefaultPasswordSaveInterceptorService.encryptPassword'
            },
            encryptUpdatePassword: {
                type: 'preUpdate',
                active: 'true',
                index: 0,
                handler: 'DefaultPasswordSaveInterceptorService.encryptPassword'
            },
        }*/
    }
};