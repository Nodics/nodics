/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/facade/schema/DefaultSchemaWorkbenchFacade
 * @description Stable facade for client-safe schema discovery.
 * @layer facade
 * @owner nDatabase
 * @override Projects may replace this facade through normal layered
 * registration without bypassing the owning discovery service.
 */
module.exports = {
    list: request => SERVICE.DefaultSchemaWorkbenchService.list(request),
    get: request => SERVICE.DefaultSchemaWorkbenchService.get(request),
    search: request => SERVICE.DefaultSchemaWorkbenchService.search(request),
    previewDeleteImpact: request =>
        SERVICE.DefaultSchemaWorkbenchService.previewDeleteImpact(request),
    bulk: request => SERVICE.DefaultSchemaWorkbenchService.bulk(request),
    aggregate: request => SERVICE.DefaultSchemaWorkbenchService.aggregate(request)
};
