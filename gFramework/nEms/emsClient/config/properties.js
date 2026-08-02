/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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