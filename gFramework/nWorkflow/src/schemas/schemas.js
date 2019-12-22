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