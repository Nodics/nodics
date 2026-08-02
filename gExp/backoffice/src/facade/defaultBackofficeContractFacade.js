/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/facade/DefaultBackofficeContractFacade
 * @description Delegates BackOffice contract-history operations to the lifecycle service.
 * @layer facade
 * @owner backoffice
 * @override Later modules may replace orchestration while preserving the public contract lifecycle.
 */
module.exports = {
    /** Initializes the facade. */
    init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Delegates current lookup. */
    current: request => SERVICE.DefaultBackofficeContractLifecycleService.current(request),
    /** Delegates history lookup. */
    history: request => SERVICE.DefaultBackofficeContractLifecycleService.history(request),
    /** Delegates comparison. */
    compare: request => SERVICE.DefaultBackofficeContractLifecycleService.compare(request),
    /** Delegates approval. */
    approve: request => SERVICE.DefaultBackofficeContractLifecycleService.approve(request),
    /** Delegates rejection. */
    reject: request => SERVICE.DefaultBackofficeContractLifecycleService.reject(request),
    /** Delegates rollback. */
    rollback: request => SERVICE.DefaultBackofficeContractLifecycleService.rollback(request)
};
