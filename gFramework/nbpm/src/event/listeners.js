/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nbpm/src/event/listeners
 * @description Documents nbpm listeners module behavior.
 * @layer event
 * @owner nbpm
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {
        workflow2SchemaSaveListener: {
            event: 'workflow2SchemaSave',
            listener: 'DefaultWorkflow2SchemaChangeListenerService.handleWorkflow2SchemaUpdateEventHandler'
        },
        workflow2SchemaUpdatedListener: {
            event: 'workflow2SchemaUpdated',
            listener: 'DefaultWorkflow2SchemaChangeListenerService.handleWorkflow2SchemaUpdateEventHandler'
        }
    }
};