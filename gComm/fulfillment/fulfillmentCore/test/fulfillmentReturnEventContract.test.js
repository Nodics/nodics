/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert=require('assert');let captured;global.SERVICE={DefaultEventService:{handleEvent:async request=>{captured=request.event;}}};const service=require('../src/service/return/defaultFulfillmentReturnEventService');(async()=>{await service.publish({tenant:'default'},{returnCode:'return-1',orderCode:'order-1',enterpriseCode:'ent-1',status:'CLOSED',dispositionCode:'RESTOCK',rawCarrierPayload:{secret:true}},'RETURN_DISPOSITIONED');assert.strictEqual(captured.event,'fulfillmentReturn.return_dispositioned');assert.strictEqual(captured.data.dispositionCode,'RESTOCK');assert.strictEqual(JSON.stringify(captured).includes('rawCarrierPayload'),false);console.log('Fulfillment Return event contract validated');})().catch(error=>{console.error(error);process.exit(1);});
