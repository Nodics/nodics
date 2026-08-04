/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/data/lifecycle/defaultOrderLifecycleReasonData @description Default draft lifecycle reasons for Axis maker-checker management. @layer data @owner order */
module.exports = {
  customerRequest: { entCode: 'default', reasonCode: 'CUSTOMER_REQUEST', label: 'Customer request', requestTypes: ['CANCELLATION'], requiredEvidence: [], status: 'DRAFT', version: 1 },
  damaged: { entCode: 'default', reasonCode: 'DAMAGED', label: 'Damaged item', requestTypes: ['RETURN'], requiredEvidence: ['IMAGE', 'PACKAGE_CONDITION'], status: 'DRAFT', version: 1 },
  goodwill: { entCode: 'default', reasonCode: 'GOODWILL', label: 'Goodwill credit', requestTypes: ['REFUND'], requiredEvidence: ['SUPPORT_NOTE'], status: 'DRAFT', version: 1 },
};
