/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nSearch/search/src/service/cache/defaultCacheService
 * @description Implements nSearch default cache service business behavior and extension logic.
 * @layer service
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Retrieves search cache channel information.
     *
     * @param {*} schemaName Method input.
     * @returns {*} Method result.
     */
    getSearchCacheChannel: function (schemaName) {
        let channelName = 'search';
        if (CONFIG.get('cache').schemaCacheChannelNameMapping && CONFIG.get('cache').schemaCacheChannelNameMapping[schemaName]) {
            channelName = CONFIG.get('cache').schemaCacheChannelNameMapping[schemaName];
        }
        return channelName;
    }
};