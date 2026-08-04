/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module inventory/service/return/DefaultReturnStockDiagnosticsService @description Reports bounded Inventory-owned Return disposition metrics and missing movement correlation. @layer service @owner inventory */
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, items: value => value && Array.isArray(value.result) ? value.result : [], scan: async function (request) { let result = await SERVICE.DefaultStockMovementRecordService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: request.enterpriseCode, sourceType: 'RETURN_DISPOSITION' }, searchOptions: { limit: 501, sort: { createdAt: -1 } } }), items = this.items(result); if (items.length > 500) throw new Error('Return Stock diagnostics scan bound exceeded'); let dispositions = {}, correlations = {}, findings = []; items.forEach(item => { let code = item.reasonCode || item.movementType || 'UNKNOWN'; dispositions[code] = Number(dispositions[code] || 0) + 1; if (item.sourceCode && item.movementCode) correlations[item.sourceCode] = item.movementCode; else findings.push({ severity: 'HIGH', findingCode: 'INCONSISTENT_RETURN_STOCK_MOVEMENT', owner: 'inventory', movementCode: item.movementCode, nextActions: ['RECONCILE_RETURN_STOCK_MOVEMENT'] }); }); return { metrics: { stockDispositionCount: items.length, stockDispositionByReason: dispositions }, correlations, findings }; } };
