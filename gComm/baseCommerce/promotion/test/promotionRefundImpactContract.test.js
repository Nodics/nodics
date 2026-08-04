/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert'); const promotion = require('../config/properties').promotion, units = require('../../../../gCore/units/config/properties').units; global.CONFIG = { get: key => key === 'promotion' ? promotion : key === 'units' ? units : undefined }; global.CLASSES = { NodicsError: class extends Error { constructor(code,message) { super(message); this.code=code; } } }; global.SERVICE = { DefaultExactUnitsService: require('../../../../gCore/units/src/service/exact/defaultExactUnitsService') }; const service = require('../src/service/refund/defaultPromotionRefundImpactService');
const result = service.calculate({ tenant:'default', authData:{tokenType:'service'}, promotionRefundImpact:{entCode:'ent-1',orderCode:'order-1',currencyCode:'USD',items:[{orderEntryCode:'entry-1',requestedQuantity:'1',orderedQuantity:'4',currencyCode:'USD',discountTotal:'5.00',priceEvidenceCode:'price-1'}]}}); assert.strictEqual(result.discountRefundImpact,'1.25'); assert.strictEqual(result.clawbackApplied,false); console.log('Promotion Refund impact contract validated');
