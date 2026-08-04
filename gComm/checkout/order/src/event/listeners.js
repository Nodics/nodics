/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/event/listeners @description Order-owned consumers of normalized adjacent-owner lifecycle facts. @layer event @owner order @override Customer modules may replace eligibility projection while preserving Order authority and idempotency. */
module.exports = { order: {
  fulfillmentReturnClosed: { event: 'fulfillmentReturn.return_closed', listener: 'DefaultOrderReturnOutcomeService.handleClosed' },
  fulfillmentReturnFailed: { event: 'fulfillmentReturn.return_failed', listener: 'DefaultOrderReturnOutcomeService.handleFailure' },
} };
