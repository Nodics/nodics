/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    workflow: {

        workflowItem: {
            super: 'base',
            model: false,
            service: false,
            router: false,
            definition: {
                item: {
                    type: 'object',
                    required: true
                },
                'item.code': {
                    type: 'string',
                    required: true,
                    description: 'Mandate item code'
                },
                'item.schemaName': {
                    type: 'string',
                    required: true,
                    description: 'Mandate schema name'
                },
                'item.moduleName': {
                    type: 'string',
                    required: true,
                    description: 'Mandate module name'
                },
                workflowHead: {
                    type: 'object',
                    required: true
                },
                'workflowHead.code': {
                    type: 'string',
                    required: true,
                    description: 'Mandate workflow head code'
                },
                'workflowHead.status': {
                    type: 'string',
                    required: true,
                    description: 'Mandate workflow head status'
                },

                workflowAction: {
                    type: 'object',
                    required: false
                },
                'workflowAction.code': {
                    type: 'string',
                    required: false,
                    description: 'Optional workflow action code'
                },
                'workflowAction.status': {
                    type: 'string',
                    required: false,
                    description: 'Optional workflow action status'
                },

                error: {
                    type: 'object',
                    required: false
                },
                'error.code': {
                    type: 'string',
                    required: false,
                    description: 'Optional error code'
                },
                'error.message': {
                    type: 'string',
                    required: false,
                    description: 'Optional error message'
                },
                'error.stackTrace': {
                    type: 'string',
                    required: false,
                    description: 'Optional error stack trace'
                },

            }
        },

        /**
         * This schema hold all the items, associated with one of the workflow and which state the item is currently.
         * This item will hold the reference of its actuall stage, I mean, which workflow and where it is currently
         */
        workflowActiveItem: {
            super: 'workflowItem',
            model: true,
            service: true,
            router: true,
            definition: {

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

        /**
         * This is header definition for all the workflow item created within system, This also hold 
         * number of items currently associated with this workflow
         */
        workflowHead: {
            super: 'base',
            model: true,
            service: true,
            router: true,
            definition: {

            }
        },

        /**
         * This is the position where an item exist currently. This action could be manual or auto performable.
         * If item is auto performable, there will a service associated to do its job and pass to respective
         * channel based on its result. For manual, it will wait for the trigger, which could be triggered from 
         * UI user interection.
         */
        workflowAction: {
            super: 'base',
            model: true,
            service: true,
            router: true,
            definition: {

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

            }
        }
    }
};