/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    modelsFindInitializerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.validateRequest',
                success: 'buildOptions'
            },
            buildOptions: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.buildOptions',
                success: 'lookupCache'
            },
            lookupCache: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.lookupCache',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.applyPreInterceptors',
                success: 'executeQuery'
            },
            executeQuery: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.executeQuery',
                success: 'populateSubModels'
            },
            populateSubModels: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.populateSubModels',
                success: 'populateVirtualProperties'
            },
            populateVirtualProperties: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.populateVirtualProperties',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.applyPostInterceptors',
                success: 'updateCache'
            },
            updateCache: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.updateCache',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultModelsFindInitializerService.handleErrorEnd'
            }
        }
    },
};