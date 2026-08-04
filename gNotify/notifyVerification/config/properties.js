/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module notifyVerification/config/properties
 * @description Defines generated configurable defaults for notifyVerification.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = { notifyVerification: { defaultMode: 'NODICS_OTP', providerManagedEnabled: false, expirySeconds: 300, attemptLimit: 5, resendCooldownSeconds: 30, channelByRecipientType: { EMAIL: 'email', MOBILE: 'sms' } } };
