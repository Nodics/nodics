/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/config/postscripts
 * @description Startup script contribution that starts configured cron jobs after the server reaches the started state.
 * @layer config
 * @owner cronjob
 * @override Project modules may add later post-start scripts for customer-specific job activation.
 */
module.exports = {
    /**
     * Starts active jobs on startup when `cronjob.runOnStartup` is enabled.
     *
     * @returns {void}
     */
    startJobsOnStartup: function () {
        SERVICE.DefaultCronJobService.startOnStartup();
    }
};
