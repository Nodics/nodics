/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available contract test. */
const assert = require('assert'); global.SERVICE = { DefaultStockMovementRecordService: { get: async () => ({ result: [{ movementCode: 'movement-1', sourceCode: 'return-1', reasonCode: 'RESTOCK' }, { movementCode: 'movement-2', reasonCode: 'SCRAP' }] }) } }; const service = require('../src/service/return/defaultReturnStockDiagnosticsService'); (async () => { let result = await service.scan({ tenant: 'default', authData: { tokenType: 'access' }, enterpriseCode: 'ent-1' }); assert.strictEqual(result.metrics.stockDispositionCount, 2); assert.strictEqual(result.metrics.stockDispositionByReason.SCRAP, 1); assert.strictEqual(result.correlations['return-1'], 'movement-1'); assert(result.findings.some(value => value.findingCode === 'INCONSISTENT_RETURN_STOCK_MOVEMENT')); console.log('Return Stock diagnostics contract validated'); })().catch(error => { console.error(error); process.exit(1); });
