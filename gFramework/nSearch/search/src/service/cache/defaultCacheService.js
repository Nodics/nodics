/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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