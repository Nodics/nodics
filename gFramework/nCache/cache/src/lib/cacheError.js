/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nCache/cache/src/lib/cacheError
 * @description Provides reusable nCache library primitives for cache error.
 * @layer lib
 * @owner nCache
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = class CacheError extends CLASSES.NodicsError {
    constructor(error, message, defaultCode = CONFIG.get('defaultErrorCodes').CacheError) {
        super(error, message, defaultCode);
        super.name = 'CacheError';
    }
};