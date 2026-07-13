/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
