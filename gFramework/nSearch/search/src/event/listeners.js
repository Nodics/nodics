/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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