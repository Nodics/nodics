/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    initializeMobileKycPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultMobileKycInitPipelineService.validateRequest',
                success: 'buildKycCarrierModel'
            },
            buildKycCarrierModel: {
                type: 'function',
                handler: 'DefaultMobileKycInitPipelineService.buildKycCarrierModel',
                success: 'initMobileKyc'
            },
            initMobileKyc: {
                type: 'function',
                handler: 'DefaultMobileKycInitPipelineService.initMobileKyc',
                success: 'buildKycModel'
            },
            buildKycModel: {
                type: 'function',
                handler: 'DefaultMobileKycInitPipelineService.buildKycModel',
                success: 'updateKycModel'
            },
            updateKycModel: {
                type: 'function',
                handler: 'DefaultMobileKycInitPipelineService.updateKycModel',
                success: 'successEnd'
            }
        }
    },
    initializeEmailKycPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultEmailKycInitPipelineService.validateRequest',
                success: 'buildKycModel'
            },
            buildKycModel: {
                type: 'function',
                handler: 'DefaultEmailKycInitPipelineService.buildKycModel',
                success: 'buildWorkflowCarrier'
            },
            buildWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultEmailKycInitPipelineService.buildWorkflowCarrier',
                success: 'initEmailKyc'
            },
            initEmailKyc: {
                type: 'function',
                handler: 'DefaultEmailKycInitPipelineService.initEmailKyc',
                success: 'updateKycModel'
            },
            updateKycModel: {
                type: 'function',
                handler: 'DefaultEmailKycInitPipelineService.updateKycModel',
                success: 'successEnd'
            }
        }
    },
    sendKycTokenPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultMobileKycInitPipelineService.validateRequest',
                success: 'buildKycModel'
            },
            buildKycModel: {
                type: 'function',
                handler: 'DefaultMobileKycInitPipelineService.buildKycModel',
                success: 'buildWorkflowCarrier'
            },
            buildWorkflowCarrier: {
                type: 'function',
                handler: 'DefaultMobileKycInitPipelineService.buildWorkflowCarrier',
                success: 'initMobileKyc'
            },
            initMobileKyc: {
                type: 'function',
                handler: 'DefaultMobileKycInitPipelineService.initMobileKyc',
                success: 'updateKycModel'
            },
            updateKycModel: {
                type: 'function',
                handler: 'DefaultMobileKycInitPipelineService.updateKycModel',
                success: 'successEnd'
            }
        }
    },

    validateMobileKycPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultMobileKycValidatePipelineService.validateRequest',
                success: 'buildKycQuery'
            },
            buildKycQuery: {
                type: 'function',
                handler: 'DefaultMobileKycValidatePipelineService.buildKycQuery',
                success: 'loadKycMode'
            },
            loadKycMode: {
                type: 'function',
                handler: 'DefaultMobileKycValidatePipelineService.loadKycMode',
                success: 'validateMobileKyc'
            },
            validateMobileKyc: {
                type: 'function',
                handler: 'DefaultMobileKycValidatePipelineService.validateMobileKyc',
                success: 'updateMobileKycWorkflow'
            },
            updateMobileKycWorkflow: {
                type: 'function',
                handler: 'DefaultMobileKycValidatePipelineService.updateMobileKycWorkflow',
                success: 'updateMobileKycModel'
            },
            updateMobileKycModel: {
                type: 'function',
                handler: 'DefaultMobileKycValidatePipelineService.updateMobileKycModel',
                success: 'successEnd'
            }
        }
    },
};