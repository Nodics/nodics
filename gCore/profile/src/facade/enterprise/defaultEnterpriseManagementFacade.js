/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/facade/enterprise/DefaultEnterpriseManagementFacade
 * @description Provides the replaceable Profile facade boundary for enterprise management reads.
 * @layer facade
 * @owner profile
 * @override Later modules may compose additional policy while delegating persistence and projection to Profile services.
 */
module.exports = {
    /** Delegates bounded enterprise search to the authoritative Profile service. */
    search: function (request) {
        return SERVICE.DefaultEnterpriseManagementService.search(request);
    },
    /** Delegates confirmed enterprise creation to the authoritative Profile service. */
    create: function (request) {
        return SERVICE.DefaultEnterpriseManagementService.create(request);
    }
};
