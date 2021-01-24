/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    postSaveClassConfiguration: {
        type: 'schema',
        item: 'classConfiguration',
        trigger: 'postSave',
        active: 'true',
        index: 0,
        handler: 'DefaultClassConfigurationSaveInterceptorService.removeBody'
    },

    checkModuleSchemaConfiguration: {
        type: 'schema',
        item: 'schemaConfiguration',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSchemaConfigurationSaveInterceptorService.checkIfModuleActive'
    },

    accessGroupsSchemaConfiguration: {
        type: 'schema',
        item: 'schemaConfiguration',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSchemaConfigurationSaveInterceptorService.assignDefaultAccessGroup'
    }
};