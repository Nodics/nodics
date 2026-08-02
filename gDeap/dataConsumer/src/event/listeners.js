/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gDeap/dataConsumer/src/event/listeners
 * @description Documents dataConsumer listeners module behavior.
 * @layer event
 * @owner dataConsumer
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {
        handleInternalDataPush: {
            event: 'internalDataPushEvent',
            listener: 'DefaultInternalDataEventHandlerService.handleInternalDataPushEvent'
        },
        handleExternalDataPush: {
            event: 'externalDataPushEvent',
            listener: 'DefaultExternalDataEventHandlerService.handleExternalDataPushEvent'
        }
    }
};