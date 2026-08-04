/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/facade/lifecycle/DefaultOrderLifecycleOperationsFacade @description Delegates permissioned lifecycle diagnostics. @layer facade @owner order */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, diagnostics: request => SERVICE.DefaultOrderLifecycleDiagnosticsService.scan(request), notificationResult: request => SERVICE.DefaultOrderLifecycleNotificationResultService.record(request), managePolicy: request => SERVICE.DefaultOrderLifecyclePolicyManagementService.managePolicy(request), manageReason: request => SERVICE.DefaultOrderLifecyclePolicyManagementService.manageReason(request) };
