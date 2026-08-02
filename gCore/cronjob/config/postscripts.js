/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
