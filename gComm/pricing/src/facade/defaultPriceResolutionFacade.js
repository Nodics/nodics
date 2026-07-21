/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/facade/DefaultPriceResolutionFacade @description Facade for cached Online Price resolution. @layer facade @owner pricing */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, resolve: function (request) { return SERVICE.DefaultPriceResolutionCacheService.resolve(request); } };
