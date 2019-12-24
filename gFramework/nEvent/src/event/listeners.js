/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
        listenerUpdateListener: {
            event: 'listenerSave',
            listener: 'DefaultListenerChangeListenerService.handleListenerUpdateEvent'
        },
        listenerRemovedListener: {
            event: 'listenerRemoved',
            listener: 'DefaultListenerChangeListenerService.handleListenerRemovedEvent'
        },
    }
};