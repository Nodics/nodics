/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
