/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nEvent/src/event/listeners
 * @description Documents nEvent listeners module behavior.
 * @layer event
 * @owner nEvent
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {
        apiKeyUpdateListener: {
            event: 'apiKeyUpdate',
            listener: 'DefaultAPIKeyService.handleApiKeyUpdate'
        },
        apiKeyRemoveListener: {
            event: 'apiKeyRemove',
            listener: 'DefaultAPIKeyService.handleApiKeyRemove'
        },
        addEnterpriseListener: {
            event: 'addEnterprise',
            listener: 'DefaultEnterpriseUpdateListenerService.handleAddEnterprise'
        },
        removeEnterpriseListener: {
            event: 'removeEnterprise',
            listener: 'DefaultEnterpriseUpdateListenerService.handleRemoveEnterprise'
        },
        listenerSavedListener: {
            event: 'listenerSave',
            listener: 'DefaultListenerChangeListenerService.handleListenerUpdateEvent'
        },
        listenerUpdateListener: {
            event: 'listenerUpdated',
            listener: 'DefaultListenerChangeListenerService.handleListenerUpdateEvent'
        },
        listenerRemovedListener: {
            event: 'listenerRemoved',
            listener: 'DefaultListenerChangeListenerService.handleListenerRemovedEvent'
        },
    }
};