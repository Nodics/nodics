/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    workflow: {
        /**
         * This schema hold all the items, associated with one of the workflow and which state the item is currently.
         * This item will hold the reference of its actuall stage, I mean, which workflow and where it is currently
         */
        workflowItem: {
            super: 'base',
            model: true,
            service: true,
            router: true,
            definition: {
                originalCode: {
                    type: 'string',
                    required: true,
                    description: 'Mandate item code'
                },
                refId: {
                    type: 'string',
                    required: true,
                    description: 'Mandate item reference id'
                },
                type: {
                    enum: [ENUMS.WorkflowItemType.INTERNAL.key, ENUMS.WorkflowItemType.EXTERNAL.key],
                    required: true,
                    description: 'Mandate item type [INTERNAL, EXTERNAL]'
                },
                detail: {
                    type: 'object',
                    required: true,
                    description: 'Required detail of item, either internal or external'
                },
                event: {
                    type: 'object',
                    required: false,
                    description: 'Required event configuration'
                },
                callbackData: {
                    type: 'object',
                    required: false,
                    description: 'Required callbackData to sent it along with event'
                },
                heads: {
                    type: 'array',
                    required: false,
                    description: 'All actions this item passed through'
                },
                activeHead: {
                    type: 'object',
                    required: true
                },
                'activeHead.code': {
                    type: 'string',
                    required: true,
                    description: 'Mandate workflow head code'
                },
                'activeHead.state': {
                    enum: [ENUMS.WorkflowActionState.NEW.key, ENUMS.WorkflowActionState.PROCESSING.key, ENUMS.WorkflowActionState.FINISHED.key, ENUMS.WorkflowActionState.ERROR.key],
                    required: true,
                    default: ENUMS.WorkflowActionState.NEW.key,
                    description: 'Mandate workflow head state [NEW, PROCESSING, FINISHED, ERROR]'
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
                    enum: [ENUMS.WorkflowActionState.NEW.key, ENUMS.WorkflowActionState.PROCESSING.key, ENUMS.WorkflowActionState.FINISHED.key, ENUMS.WorkflowActionState.ERROR.key],
                    required: true,
                    default: ENUMS.WorkflowActionState.NEW.key,
                    description: 'Mandate workflow head state [NEW, PROCESSING, FINISHED, ERROR]'
                },
                state: {
                    enum: [ENUMS.WorkflowItemState.NEW.key, ENUMS.WorkflowItemState.PROCESSING.key, ENUMS.WorkflowItemState.FINISHED.key, ENUMS.WorkflowItemState.ERROR.key, ENUMS.WorkflowItemState.FATAL.key],
                    required: false,
                    default: ENUMS.WorkflowItemState.NEW.key,
                    description: 'Mandate workflow head state [NEW, PROCESSING, FINISHED, FATAL]'
                },
                errorCount: {
                    type: 'int',
                    default: 0,
                    required: true
                },
                errors: {
                    type: 'array',
                    required: false
                }
            }
        },

        workflowArchivedItem: {
            super: 'workflowItem',
            model: true,
            service: true,
            router: true,
            definition: {

            }
        },

        workflowErrorItem: {
            super: 'workflowItem',
            model: true,
            service: true,
            router: true,
            definition: {

            }
        },

        actionResponse: {
            super: 'super',
            model: true,
            service: true,
            router: true,
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
                    enum: [ENUMS.WorkflowActionResponseType.PASS.key, ENUMS.WorkflowActionResponseType.SUCCESS.key, ENUMS.WorkflowActionResponseType.ERROR.key],
                    required: true,
                    description: 'Mandate workflow head state [PASS, SUCCESS, ERROR]'
                },
                feedback: {
                    type: 'object',
                    required: true,
                    description: 'Required response message, which contain all the data approval send for next step'
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
            service: true,
            router: true,
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

        workflow: {
            super: 'base',
            model: false,
            service: false,
            router: false,
            refSchema: {
                channels: {
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
                script: {
                    type: 'string',
                    required: false,
                    description: 'Define script for this action, if its type is AUTO'
                },
                userGroups: {
                    type: 'array',
                    required: true,
                    default: ['workflowUserGroup'],
                    description: 'User group code for which this user belongs'
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
            service: true,
            router: true,
            definition: {
                position: {
                    default: ENUMS.WorkflowActionPosition.ACTION.key
                },
                successHandler: {
                    type: 'string',
                    required: false,
                    description: 'Required channel name for success handler'
                }
            }
        },

        /**
         * This is header definition for all the workflow item created within system, This also hold 
         * number of items currently associated with this workflow
         */
        workflowHead: {
            super: 'workflow',
            model: true,
            service: true,
            router: true,
            definition: {
                position: {
                    default: ENUMS.WorkflowActionPosition.HEAD.key
                },
            }
        }
    }
};