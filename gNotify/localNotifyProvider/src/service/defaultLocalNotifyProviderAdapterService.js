/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module localNotifyProvider/service/DefaultLocalNotifyProviderAdapterService @description Deterministic non-production adapter for development and contract tests; never logs recipient or content. @layer provider @owner localNotifyProvider */
const crypto = require('crypto');
module.exports = { init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, send: function (message) { let config = CONFIG.get('notifyLocalProvider') || {}; if (config.enabled === false) return Promise.reject(Object.assign(new Error('Local notification provider disabled'), { code: 'LOCAL_PROVIDER_DISABLED', retryable: false })); let reference = 'local-' + crypto.createHash('sha256').update(String(message.requestCode) + ':' + String(message.idempotencyKey)).digest('hex').slice(0, 20); return Promise.resolve({ status: 'SENT', resultCode: 'LOCAL_ACCEPTED', providerMessageReference: reference, safeEvidence: { adapter: 'local', simulated: true } }); } };
