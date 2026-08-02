/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/facade/DefaultBackofficeAxisPolicyFacade
 * @description Delegates secured Axis policy operations to the BackOffice-owned policy service.
 * @layer facade
 * @owner backoffice
 */
module.exports = {
    /** Initializes the Axis policy facade. */
    init: function () { return Promise.resolve(true); },
    /** Completes Axis policy facade initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the effective policy. */
    get: request => SERVICE.DefaultAxisExperiencePolicyService.get(request),
    /** Updates the persistent policy. */
    update: request => SERVICE.DefaultAxisExperiencePolicyService.update(request)
};
