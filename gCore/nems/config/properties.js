/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nems/config/properties
 * @description NEMS properties for event fetch/reset behavior, publish node selection, and module naming.
 * @layer config
 * @owner nems
 * @override Project, environment, server, or node layers may override event processing behavior.
 */
module.exports = {
    eventFetchSize: 100,
    publishEventOnNode: '0',
    eventResetTimeInMinutes: 300,
    nemsModuleName: 'nems',
};
