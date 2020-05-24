/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    workflow: {

        workflow: {
            super: 'base',
            model: false,
            service: {
                enabled: false
            },
            router: {
                enabled: false
            },
            cache: {
                enabled: true,
                ttl: 1000
            },
            refSchema: {
                channels: {
                    enabled: true,
                    schemaName: "workflowChannel",
                    type: 'many',
                    propertyName: 'code'
                }
            },
            definition: {
                type: {
                    enum: [ENUMS.WorkflowActionType.MANUAL.key, ENUMS.WorkflowActionType.AUTO.key, ENUMS.WorkflowActionType.PARALLEL.key],
                    required: true,
                    default: ENUMS.WorkflowActionType.MANUAL.key,
                    description: 'Mandate workflow head state [MANUAL, AUTO, PARALLEL]'
                },
                position: {
                    enum: [ENUMS.WorkflowActionPosition.HEAD.key, ENUMS.WorkflowActionPosition.ACTION.key, ENUMS.WorkflowActionPosition.END.key],
                    required: true,
                    description: 'Mandate workflow head state [HEAD, ACTION, END]'
                },
                handler: {
                    type: 'string',
                    required: false,
                    description: 'Define handler for this action, if its type is AUTO'
                },
                isNewItemsAllowed: {
                    type: 'bool',
                    required: true,
                    default: true,
                    description: 'Define handler for this action, if its type is AUTO'
                },
                script: {
                    type: 'string',
                    required: false,
                    description: 'Define script for this action, if its type is AUTO'
                },
                allowedDecisions: {
                    type: 'array',
                    required: false,
                    description: 'List of decisions can be taken'
                },
                channels: {
                    type: 'array',
                    required: false,
                    description: 'List of channels for the item'
                },
                eventDetail: {
                    type: 'object',
                    required: false,
                    description: 'This hold data for external system, to publish action event'
                },
                successHandler: {
                    type: 'string',
                    required: false,
                    description: 'Required channel name for success handler'
                },
                errorHandler: {
                    type: 'string',
                    required: true,
                    description: 'Required channel name for error handler'
                },
            }
        },
        /**
         * This is the position where an item exist currently. This action could be manual or auto performable.
         * If item is auto performable, there will a service associated to do its job and pass to respective
         * channel based on its result. For manual, it will wait for the trigger, which could be triggered from 
         * UI user interection.
         */
        workflowAction: {
            super: 'workflow',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            definition: {
                position: {
                    default: ENUMS.WorkflowActionPosition.ACTION.key
                }
            }
        },

        /**
         * Channels are transition for travelling one action to another, based on result we got from executed action.
         * There could be multiple channels associated with one action. Multiple channels can target to single action
         */
        workflowChannel: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 1000
            },
            definition: {
                qualifier: {
                    type: 'object',
                    required: true,
                    description: 'Required qualifier, which evaluate item, if this is for current channel'
                },
                'qualifier.decision': {
                    type: 'string',
                    required: false,
                    description: 'Define decision for this qualifier'
                },
                'qualifier.handler': {
                    type: 'string',
                    required: false,
                    description: 'Define handler for this qualifier'
                },
                'qualifier.script': {
                    type: 'string',
                    required: false,
                    description: 'Define script for this qualifier, handler have higher priority'
                },
                target: {
                    type: 'string',
                    required: true,
                    description: 'It hold target action for the item'
                }
            }
        },

        actionResponse: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 1000
            },
            definition: {
                active: {
                    required: false
                },
                workflowCode: {
                    type: 'string',
                    required: true,
                    description: 'Required step code, it could be workflow head code or any of the action code'
                },
                actionCode: {
                    type: 'string',
                    required: true,
                    description: 'Required step code, it could be workflow head code or any of the action code'
                },
                decision: {
                    type: 'string',
                    required: true,
                    description: 'Required decision, This decide which channel will process this item'
                },
                type: {
                    enum: [ENUMS.WorkflowActionResponseType.SUCCESS.key, ENUMS.WorkflowActionResponseType.REJECTED.key, ENUMS.WorkflowActionResponseType.ERROR.key],
                    required: true,
                    description: 'Mandate workflow head state [SUCCESS, REJECTED, ERROR]'
                },
                feedback: {
                    type: 'object',
                    required: true,
                    description: 'Required response message, which contain all the data approval send for next step'
                }
            }
        },

        workflowCarrierState: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            definition: {

            }
        },

        workflowCarrier: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            refSchema: {
                items: {
                    enabled: true,
                    schemaName: "workflowItem",
                    type: 'many',
                    propertyName: 'code',
                    searchOptions: {
                        projection: { _id: 0 }
                    }
                }
            },
            definition: {
                originalCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional carrier original code'
                },
                type: {
                    enum: [ENUMS.WorkflowCarrierType.FIXED.key, ENUMS.WorkflowCarrierType.FLAXI.key],
                    required: true,
                    default: ENUMS.WorkflowCarrierType.FIXED.key,
                    description: 'Mandate item type [FIXED, FLAXI]'
                },
                sourceDetail: {
                    type: 'object',
                    required: true,
                    description: 'Required sourceDetail of item, either internal or external'
                },
                event: {
                    type: 'object',
                    required: false,
                    description: 'Required event configuration'
                },
                heads: {
                    type: 'array',
                    required: false,
                    description: 'All actions this item passed through'
                },
                activeHead: {
                    type: 'string',
                    required: true,
                    description: 'required workflow head code'
                },
                actions: {
                    type: 'array',
                    required: false,
                    description: 'All actions this item passed through'
                },
                activeAction: {
                    type: 'object',
                    required: true
                },
                'activeAction.code': {
                    type: 'string',
                    required: true,
                    description: 'Optional workflow action code'
                },
                'activeAction.state': {
                    enum: [ENUMS.WorkflowCarrierState.INIT.key,
                    ENUMS.WorkflowCarrierState.RELEASED.key,
                    ENUMS.WorkflowCarrierState.PROCESSING.key,
                    ENUMS.WorkflowCarrierState.PAUSED.key,
                    ENUMS.WorkflowCarrierState.BLOCKED.key,
                    ENUMS.WorkflowCarrierState.FINISHED.key,
                    ENUMS.WorkflowCarrierState.ERROR.key,
                    ENUMS.WorkflowCarrierState.FATAL.key],
                    required: true,
                    default: ENUMS.WorkflowActionState.NEW.key,
                    description: 'Mandate workflow head state [INIT, RELEASED, PROCESSING, PAUSED, BLOCKED, FINISHED, ERROR, FATALL]'
                },
                errorCount: {
                    type: 'int',
                    default: 0,
                    required: true
                },
                errors: {
                    type: 'array',
                    required: false
                },
                items: {
                    type: 'array',
                    required: false,
                    description: 'List of items associated with this carrier'
                },
                states: {
                    type: 'array',
                    required: true,
                    description: 'List of status items for each status changes'
                },
                currentState: {
                    type: 'object',
                    required: true,
                    description: 'Last status updated to the carrier'
                },
                'currentState.state': {
                    enum: [ENUMS.WorkflowCarrierState.INIT.key,
                    ENUMS.WorkflowCarrierState.RELEASED.key,
                    ENUMS.WorkflowCarrierState.PROCESSING.key,
                    ENUMS.WorkflowCarrierState.PAUSED.key,
                    ENUMS.WorkflowCarrierState.BLOCKED.key,
                    ENUMS.WorkflowCarrierState.FINISHED.key,
                    ENUMS.WorkflowCarrierState.ERROR.key,
                    ENUMS.WorkflowCarrierState.FATAL.key],
                    required: true,
                    default: ENUMS.WorkflowCarrierState.INIT.key,
                    description: 'Mandate workflow head state [INIT, RELEASED, PROCESSING, PAUSED, BLOCKED, FINISHED, ERROR, FATAL]'
                },
                'currentState.description': {
                    type: 'string',
                    required: true,
                    description: 'Mandate description of state'
                },
                'currentState.action': {
                    type: 'string',
                    required: true,
                    description: 'Mandate action code, where this state added'
                },
                'currentState.time': {
                    type: 'date',
                    required: true,
                    description: 'Mandate timestamp, when this state added'
                }

            }
        },

        /**
         * This schema hold all the items, associated with one of the workflow and which state the item is currently.
         * This item will hold the reference of its actuall stage, I mean, which workflow and where it is currently
         */
        workflowItem: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            definition: {

            }
        },

        workflowArchivedCarrier: {
            super: 'workflowCarrier',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            refSchema: {
                items: {
                    enabled: true,
                    schemaName: "workflowArchivedItem",
                    type: 'many',
                    propertyName: '_id'
                },
                states: {
                    enabled: false
                },
            },
            definition: {
                code: {
                    primary: false
                }
            }
        },

        workflowErrorCarrier: {
            super: 'workflowCarrier',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            refSchema: {
                items: {
                    enabled: true,
                    schemaName: "workflowArchivedItem",
                    type: 'many',
                    propertyName: '_id'
                },
                states: {
                    enabled: false
                },
            },
            definition: {
                code: {
                    primary: false
                }
            }
        },

        workflowArchivedItem: {
            super: 'workflowItem',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            definition: {
                code: {
                    primary: false
                }
            }
        }
    }
};