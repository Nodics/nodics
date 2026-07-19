/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module backoffice/facade/DefaultBackofficeRegistryFacade
 * @description Delegates BackOffice registry API operations to the owning registry service.
 * @layer facade
 * @owner backoffice
 * @override Later modules may replace orchestration while preserving registry route contracts.
 */
module.exports = {
    /** Initializes the registry facade. */
    init: function () { return Promise.resolve(true); },
    /** Finalizes registry facade initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Delegates module registration. */
    register: request => SERVICE.DefaultBackofficeRegistryService.register(request),
    /** Delegates module deregistration. */
    deregister: request => SERVICE.DefaultBackofficeRegistryService.deregister(request),
    /** Delegates client-safe discovery. */
    list: request => SERVICE.DefaultBackofficeRegistryService.list(request),
    /** Delegates authorized BackOffice client bootstrap. */
    bootstrap: request => SERVICE.DefaultBackofficeRegistryService.bootstrap(request),
    /** Delegates secured registry diagnostics. */
    diagnostics: request => SERVICE.DefaultBackofficeRegistryService.diagnostics(request)
};
