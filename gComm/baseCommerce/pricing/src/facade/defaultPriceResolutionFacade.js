/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/facade/DefaultPriceResolutionFacade @description Facade for cached Online Price resolution. @layer facade @owner pricing */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, resolve: function (request) { return SERVICE.DefaultPriceResolutionCacheService.resolve(request); } };
