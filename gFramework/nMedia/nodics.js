/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/nodics
 * @description Registers the nMedia framework module lifecycle hooks.
 * @layer module
 * @owner nMedia
 * @override Later active modules may decorate lifecycle behavior without moving media storage authority out of nMedia.
 */
module.exports = {
    /**
     * Initializes the nMedia framework module.
     *
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function () {
        return Promise.resolve(true);
    },
    /**
     * Finalizes the nMedia framework module after service loading.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function () {
        return Promise.resolve(true);
    }
};
