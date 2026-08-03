/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/data/cronjob/defaultPromotionReconciliationCronJobHeader
 * @description Imports the Promotion reconciliation CronJob into CronJob-owned schemas.
 * @layer data
 * @owner promotion
 * @override Customer modules may contribute later headers for environment-specific reconciliation schedules.
 */
module.exports = {
  cronjob: {
    defaultPromotionReconciliationCronJob: {
      options: {
        enabled: true,
        schemaName: "cronJob",
        operation: "saveAll",
        dataFilePrefix: "defaultPromotionReconciliationCronJobData",
      },
      query: { code: "$code" },
    },
  },
};
