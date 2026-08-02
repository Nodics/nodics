/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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