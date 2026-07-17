/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nEms/emsClient/config/properties
 * @description Defines default nEms configuration used during module startup and layering.
 * @layer config
 * @owner nEms
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {

    nodePingableModules: {
        emsClient: {
            enabled: false,
            nodeUpHandler: 'defaultEmsNodeUpHandlerPipeline',
            nodeDownHandler: 'defaultEmsNodeDownHandlerPipeline'
        }
    },

    emsClient: {
        logFailedMessages: false,
        messageHandlers: {
            jsonMessageHandler: 'jsonMessageHandlerPipeline',
            xmlMessageHandler: 'xmlMessageHandlerPipeline',
            textMessageHandler: 'textMessageHandlerPipeline',
        }
    }
};