/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert'); const tax = require('../config/properties').tax, units = require('../../../../gCore/units/config/properties').units; global.CONFIG = { get: key => key === 'tax' ? tax : key === 'units' ? units : undefined }; global.CLASSES = { NodicsError: class extends Error { constructor(code,message) { super(message); this.code=code; } } }; global.SERVICE = { DefaultExactUnitsService: require('../../../../gCore/units/src/service/exact/defaultExactUnitsService') }; const service = require('../src/service/refund/defaultTaxRefundEvidenceService');
const result = service.calculate({ tenant:'default', authData:{tokenType:'service'}, taxRefundEvidence:{entCode:'ent-1',orderCode:'order-1',currencyCode:'USD',items:[{orderEntryCode:'entry-1',requestedQuantity:'1',orderedQuantity:'2',currencyCode:'USD',taxTotal:'3.00',taxInclusionMode:'TAX_INCLUSIVE',taxIncluded:true,taxQuoteCode:'tax-1',taxQuoteLineCode:'line-1',taxJurisdictionCode:'AE'},{orderEntryCode:'entry-2',requestedQuantity:'1',orderedQuantity:'2',currencyCode:'USD',taxTotal:'2.00',taxInclusionMode:'TAX_EXCLUSIVE',taxIncluded:false,taxQuoteCode:'tax-2',taxQuoteLineCode:'line-2',taxJurisdictionCode:'AE'}]}}); assert.strictEqual(result.taxRefundAmount,'2.50'); assert.strictEqual(result.items[0].taxInclusionMode,'TAX_INCLUSIVE'); assert.strictEqual(result.items[1].taxInclusionMode,'TAX_EXCLUSIVE'); console.log('Tax Refund evidence contract validated');
