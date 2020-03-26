/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    handlePreSaveWTCode: {
        type: 'schema',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSaveWorkflow2SchemaInterceptorService.createWorkflowCode'
    },
    handlePreSaveModuleAssignment: {
        type: 'schema',
        item: 'workflow2Schema',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSaveWorkflow2SchemaInterceptorService.handlePreSaveModuleAssignment'
    },

    handlePreSaveAssignedDefaultEvents: {
        type: 'schema',
        item: 'workflow2Schema',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultSaveWorkflow2SchemaInterceptorService.handlePreSaveAssignedDefaultEvents'
    }
};