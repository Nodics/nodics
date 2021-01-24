/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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