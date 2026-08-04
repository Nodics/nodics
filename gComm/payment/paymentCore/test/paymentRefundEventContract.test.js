/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert=require('assert');let captured;global.SERVICE={DefaultEventService:{handleEvent:async request=>{captured=request.event;}}};const service=require('../src/service/refund/defaultPaymentRefundEventService');(async()=>{await service.publish({tenant:'default'},{transactionCode:'refund-tx-1',refundCode:'refund-1',orderCode:'order-1',enterpriseCode:'ent-1',providerCode:'stripe',providerTransactionRef:'safe-ref',status:'REFUNDED',providerPayload:{secret:true}},'REFUND_EXECUTED');assert.strictEqual(captured.event,'paymentRefund.refund_executed');assert.strictEqual(captured.data.providerTransactionRef,'safe-ref');assert.strictEqual(JSON.stringify(captured).includes('providerPayload'),false);console.log('Payment Refund event contract validated');})().catch(error=>{console.error(error);process.exit(1);});
