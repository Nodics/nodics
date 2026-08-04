/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module kycCore/data/lifecycle/DefaultKycLifecycleCronJobHeader @description Imports KYC lifecycle scheduling metadata into the CronJob schema authority. @layer data @owner kycCore @override Customer modules may contribute later environment-specific schedule records. */
module.exports = { cronjob: { defaultKycLifecycleCronJob: { options: { enabled: true, schemaName: 'cronJob', operation: 'saveAll', dataFilePrefix: 'defaultKycLifecycleCronJobData' }, query: { code: '$code' } } } };
