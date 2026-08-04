/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module twilioNotifyProvider/config/properties
 * @description Defines generated configurable defaults for twilioNotifyProvider.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = { notifyTwilioProvider: { enabled: false, productionReady: false, supportedChannels: ['sms', 'whatsapp'], clientService: 'DefaultTwilioClientService', secretResolverService: 'DefaultSecretReferenceService', timeoutMs: 10000, retryableErrorCodes: ['20429', '30001', '30002', '30003'], nonRetryableErrorCodes: ['21211', '21610', '21614'] } };
