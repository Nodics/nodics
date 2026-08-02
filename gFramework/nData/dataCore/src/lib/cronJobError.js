/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/dataCore/src/lib/cronJobError
 * @description Provides reusable nData library primitives for cron job error.
 * @layer lib
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = class DataError extends CLASSES.NodicsError {
    constructor(error, message, defaultCode = CONFIG.get('defaultErrorCodes').DataError) {
        super(error, message, defaultCode);
        super.name = 'CronJobError';
    }
};