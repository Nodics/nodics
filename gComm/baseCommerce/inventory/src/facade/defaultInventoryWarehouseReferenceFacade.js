/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module inventory/facade/DefaultInventoryWarehouseReferenceFacade @description Delegates Warehouse reference intent requests to Inventory authority. @layer facade @owner inventory */
module.exports = {
    /** Initializes the facade. */ init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Resolves one safe Warehouse reference. */ resolve: request => SERVICE.DefaultInventoryWarehouseReferenceService.resolve(request)
};
