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
                success: 'buildMobileKycModel'
            },
            buildMobileKycModel: {
                type: 'function',
                handler: 'DefaultMobileKycValidatePipelineService.buildMobileKycModel',
                success: 'updateMobileKycModel'
            },
            updateMobileKycModel: {
                type: 'function',
                handler: 'DefaultMobileKycValidatePipelineService.updateMobileKycModel',
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

    validateEmailKycPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultEmailKycValidatePipelineService.validateRequest',
                success: 'buildKycQuery'
            },
            buildKycQuery: {
                type: 'function',
                handler: 'DefaultEmailKycValidatePipelineService.buildKycQuery',
                success: 'loadKycMode'
            },
            loadKycMode: {
                type: 'function',
                handler: 'DefaultEmailKycValidatePipelineService.loadKycMode',
                success: 'validateMobileKyc'
            },
            validateMobileKyc: {
                type: 'function',
                handler: 'DefaultEmailKycValidatePipelineService.validateEmailKyc',
                success: 'updateMobileKycWorkflow'
            },
            updateMobileKycWorkflow: {
                type: 'function',
                handler: 'DefaultEmailKycValidatePipelineService.updateEmailKycWorkflow',
                success: 'buildMobileKycModel'
            },
            buildMobileKycModel: {
                type: 'function',
                handler: 'DefaultEmailKycValidatePipelineService.buildEmailKycModel',
                success: 'updateMobileKycModel'
            },
            updateMobileKycModel: {
                type: 'function',
                handler: 'DefaultEmailKycValidatePipelineService.updateEmailKycModel',
                success: 'successEnd'
            }
        }
    },

    initKycNotificationPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultKycNotificationInitPipelineService.validateRequest',
                success: 'buildKycQuery'
            },
            buildKycQuery: {
                type: 'function',
                handler: 'DefaultKycNotificationInitPipelineService.buildKycQuery',
                success: 'loadKycMode'
            },
            loadKycMode: {
                type: 'function',
                handler: 'DefaultKycNotificationInitPipelineService.loadKycMode',
                success: 'checkKycType'
            },
            checkKycType: {
                type: 'function',
                handler: 'DefaultKycNotificationInitPipelineService.checkKycType',
                success: {
                    mobileKyc: 'initMobileKycNotification',
                    emailKyc: 'initEmailKycNotification',
                    docKyc: 'initDocKycNotification',
                    kycError: 'handleError' // this is not required as error hanndler is default by throwing error
                }
            },
            initMobileKycNotification: {
                type: 'process',
                handler: 'initMobileKycNotification',
                success: 'successEnd'
            },
            initEmailKycNotification: {
                type: 'process',
                handler: 'initEmailKycNotification',
                success: 'successEnd'
            },
            initDocKycNotification: {
                type: 'process',
                handler: 'initDocKycNotification',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultKycNotificationInitPipelineService.handleSuccess'
            }
        }
    },

    initMobileKycNotification: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultMobileKycNotificationInitPipelineService.validateRequest',
                success: 'successEnd'
            }
        },
    },
    initEmailKycNotification: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultEmailKycNotificationInitPipelineService.validateRequest',
                success: 'successEnd'
            }
        },
    },
    initDocKycNotification: {
        startNode: "validateRequest",
        hardStop: true,
        handleError: 'handleError',

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultDocumentKycNotificationInitPipelineService.validateRequest',
                success: 'successEnd'
            }
        },
    },
};