/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nNms/src/event/listeners
 * @description Documents nNms listeners module behavior.
 * @layer event
 * @owner nNms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {

        handleNodeDownEvent: {
            event: 'nodeDownEvent',
            listener: 'DefaultNodeDownHandlerService.handleNodeDown'
        },

        handleNodeUpEvent: {
            event: 'nodeUpEvent',
            listener: 'DefaultNodeUpHandlerService.handleNodeUp'
        },

        handleResponsibilityRequestEvent: {
            event: 'handleResponsibilityRequest',
            listener: 'DefaultResponsibilityRequestHandlerService.handleResponsibilityRequest'
        }
    }
};