/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nDynamo/src/event/listeners
 * @description Documents nDynamo listeners module behavior.
 * @layer event
 * @owner nDynamo
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {
        classConfigurationSavedListener: {
            event: 'classConfigurationSave',
            listener: 'DefaultClassConfigurationChangeListenerService.handleClassUpdateEventHandler'
        },
        classConfigurationUpdatedListener: {
            event: 'classConfigurationUpdated',
            listener: 'DefaultClassConfigurationChangeListenerService.handleClassUpdateEventHandler'
        },

        routerConfigurationSavedListener: {
            event: 'routerConfigurationSave',
            listener: 'DefaultRouterConfigurationChangeListenerService.handleRouterUpdateEventHandler'
        },
        routerConfigurationUpdatedListener: {
            event: 'routerConfigurationUpdated',
            listener: 'DefaultRouterConfigurationChangeListenerService.handleRouterUpdateEventHandler'
        },

        schemaConfigurationSavedListener: {
            event: 'schemaConfigurationSave',
            listener: 'DefaultSchemaConfigurationChangeListenerService.handleSchemaUpdateEventHandler'
        },
        schemaConfigurationUpdatedListener: {
            event: 'schemaConfigurationUpdated',
            listener: 'DefaultSchemaConfigurationChangeListenerService.handleSchemaUpdateEventHandler'
        },
    }
};