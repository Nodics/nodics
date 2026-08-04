/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module kycProviderCore/config/properties @description Replaceable provider registry defaults. */
module.exports = { kyc: { providers: { adapters: {}, conformance: { requiredOperations: ['createCase', 'submitDocument', 'startCheck', 'getCaseStatus', 'handleWebhook', 'requestMoreInformation', 'cancelCase', 'reconcileCase'] } } } };
