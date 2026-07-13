/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDatabase/database/src/event/listeners
 * @description Documents nDatabase listeners module behavior.
 * @layer event
 * @owner nDatabase
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {
        schemaInterceptorUpdatedListener: {
            event: 'schemaInterceptorUpdated',
            listener: 'DefaultDatabaseConfigurationService.handleSchemaInterceptorUpdated'
        },
        schemaValidatorUpdatedListener: {
            event: 'schemaValidatorUpdated',
            listener: 'DefaultDatabaseConfigurationService.handleSchemaValidatorUpdated'
        }
    }
};