/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

module.exports = {
    defaultCronJobTriggerHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCronJobTriggerHandlerService.validateRequest',
                success: 'stateChangeRunning'
            },
            stateChangeRunning: {
                type: 'function',
                handler: 'DefaultCronJobTriggerHandlerService.stateChangeRunning',
                success: 'applyPreInterceptors'
            },
            applyPreInterceptors: {
                type: 'function',
                handler: 'DefaultCronJobTriggerHandlerService.applyPreInterceptors',
                success: 'triggerProcess'
            },
            triggerProcess: {
                type: 'function',
                handler: 'DefaultCronJobTriggerHandlerService.triggerProcess',
                success: 'applyPostInterceptors'
            },
            applyPostInterceptors: {
                type: 'function',
                handler: 'DefaultCronJobTriggerHandlerService.applyPostInterceptors',
                success: 'triggerEvent'
            },
            triggerEvent: {
                type: 'function',
                handler: 'DefaultCronJobTriggerHandlerService.triggerEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCronJobTriggerHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCronJobTriggerHandlerService.handleErrorEnd'
            }
        }
    },

    defaultCronJobCompleteHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCronJobCompletedHandlerService.validateRequest',
                success: 'applyInterceptors'
            },
            applyInterceptors: {
                type: 'function',
                handler: 'DefaultCronJobCompletedHandlerService.applyInterceptors',
                success: 'stateChangeFinished'
            },
            stateChangeFinished: {
                type: 'function',
                handler: 'DefaultCronJobCompletedHandlerService.stateChangeFinished',
                success: 'triggerEvent'
            },
            triggerEvent: {
                type: 'function',
                handler: 'DefaultCronJobCompletedHandlerService.triggerEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCronJobCompletedHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCronJobCompletedHandlerService.handleErrorEnd'
            }
        }
    },

    defaultCronJobStartHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCronJobStartHandlerService.validateRequest',
                success: 'applyInterceptors'
            },
            applyInterceptors: {
                type: 'function',
                handler: 'DefaultCronJobStartHandlerService.applyInterceptors',
                success: 'stateChangeStart'
            },
            stateChangeStart: {
                type: 'function',
                handler: 'DefaultCronJobStartHandlerService.stateChangeStart',
                success: 'triggerEvent'
            },
            triggerEvent: {
                type: 'function',
                handler: 'DefaultCronJobStartHandlerService.triggerEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCronJobStartHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCronJobStartHandlerService.handleErrorEnd'
            }
        }
    },

    defaultCronJobStopHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCronJobStopHandlerService.validateRequest',
                success: 'applyInterceptors'
            },
            applyInterceptors: {
                type: 'function',
                handler: 'DefaultCronJobStopHandlerService.applyInterceptors',
                success: 'stateChangeStoped'
            },
            stateChangeStoped: {
                type: 'function',
                handler: 'DefaultCronJobStopHandlerService.stateChangeStoped',
                success: 'triggerEvent'
            },
            triggerEvent: {
                type: 'function',
                handler: 'DefaultCronJobStopHandlerService.triggerEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCronJobStopHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCronJobStopHandlerService.handleErrorEnd'
            }
        }
    },

    defaultCronJobPauseHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCronJobPausedHandlerService.validateRequest',
                success: 'applyInterceptors'
            },
            applyInterceptors: {
                type: 'function',
                handler: 'DefaultCronJobPausedHandlerService.applyInterceptors',
                success: 'stateChangePaused'
            },
            stateChangePaused: {
                type: 'function',
                handler: 'DefaultCronJobPausedHandlerService.stateChangePaused',
                success: 'triggerEvent'
            },
            triggerEvent: {
                type: 'function',
                handler: 'DefaultCronJobPausedHandlerService.triggerEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCronJobPausedHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCronJobPausedHandlerService.handleErrorEnd'
            }
        }
    },

    defaultCronJobResumedHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCronJobResumedHandlerService.validateRequest',
                success: 'applyInterceptors'
            },
            applyInterceptors: {
                type: 'function',
                handler: 'DefaultCronJobResumedHandlerService.applyInterceptors',
                success: 'stateChangeResumed'
            },
            stateChangeResumed: {
                type: 'function',
                handler: 'DefaultCronJobResumedHandlerService.stateChangeResumed',
                success: 'triggerEvent'
            },
            triggerEvent: {
                type: 'function',
                handler: 'DefaultCronJobResumedHandlerService.triggerEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCronJobResumedHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCronJobResumedHandlerService.handleErrorEnd'
            }
        }
    },

    defaultCronJobRemovedHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCronJobRemovedHandlerService.validateRequest',
                success: 'applyInterceptors'
            },
            applyInterceptors: {
                type: 'function',
                handler: 'DefaultCronJobRemovedHandlerService.applyInterceptors',
                success: 'stateChangeRemoved'
            },
            stateChangeRemoved: {
                type: 'function',
                handler: 'DefaultCronJobRemovedHandlerService.stateChangeRemoved',
                success: 'triggerEvent'
            },
            triggerEvent: {
                type: 'function',
                handler: 'DefaultCronJobRemovedHandlerService.triggerEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCronJobRemovedHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCronJobRemovedHandlerService.handleErrorEnd'
            }
        }
    },

    defaultCronJobErrorHandlerPipeline: {
        startNode: "validateRequest",
        hardStop: true, //default value is false
        handleError: 'handleError', // define this node, within node definitions, else will take default 'handleError' one

        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultCronJobErrorHandlerService.validateRequest',
                success: 'applyInterceptors'
            },
            applyInterceptors: {
                type: 'function',
                handler: 'DefaultCronJobErrorHandlerService.applyInterceptors',
                success: 'stateChangeError'
            },
            stateChangeError: {
                type: 'function',
                handler: 'DefaultCronJobErrorHandlerService.stateChangeError',
                success: 'triggerEvent'
            },
            triggerEvent: {
                type: 'function',
                handler: 'DefaultCronJobErrorHandlerService.triggerEvent',
                success: 'successEnd'
            },
            successEnd: {
                type: 'function',
                handler: 'DefaultCronJobErrorHandlerService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultCronJobErrorHandlerService.handleErrorEnd'
            }
        }
    }
};