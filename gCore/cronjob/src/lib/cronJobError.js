/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cronjob/lib/CronJobError
 * @description Cronjob-specific Nodics error class using the configured cronjob default error code.
 * @layer lib
 * @owner cronjob
 * @override Project modules may subclass or replace cronjob errors when error taxonomy changes.
 */
module.exports = class CronJobError extends CLASSES.NodicsError {
    constructor(error, message, defaultCode = CONFIG.get('defaultErrorCodes').CronJobError) {
        super(error, message, defaultCode);
        super.name = 'CronJobError';
    }
};
