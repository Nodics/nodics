/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSearch/search/src/event/listeners
 * @description Documents nSearch listeners module behavior.
 * @layer event
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {
        searchInterceptorUpdatedListener: {
            event: 'searchInterceptorUpdated',
            listener: 'DefaultSearchConfigurationService.handleSchemaInterceptorUpdated'
        },
        searchValidatorUpdatedListener: {
            event: 'searchValidatorUpdated',
            listener: 'DefaultSearchConfigurationService.handleSearchValidatorUpdated'
        }
    }
};