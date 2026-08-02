/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/service/observability/DefaultAiProviderUsageAlertService
 * @description Publishes sanitized configured cost alerts through the existing Nodics event authority.
 * @layer service
 * @owner aiProviders
 * @override Projects may route alerts elsewhere while preserving sanitized exact-cost evidence.
 */
const economics = require('../token/defaultAiTokenEconomicsService');

module.exports = {
    /** Publishes an over-threshold event without exposing prompts, credentials, or provider payloads. */
    notify: function (input) {
        const policy = input.configuration.tokenOptimization.alerts;
        if (!policy || policy.enabled !== true ||
            economics.compareExact(input.reconciliation.actualCost, policy.maximumActualCostPerAttempt) <= 0) {
            return Promise.resolve(false);
        }
        const publisher = input.context.eventPublisher ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultEventService);
        if (!publisher || typeof publisher.publish !== 'function') {
            return Promise.resolve({ published: false, reason: 'EVENT_AUTHORITY_UNAVAILABLE' });
        }
        return Promise.resolve(publisher.publish({
            tenant: input.context.tenantCode || input.context.tenant,
            source: 'aiProviders', target: policy.eventTarget, event: policy.eventName,
            data: {
                profileCode: input.plan.profileCode, providerCode: input.plan.provider,
                modelCode: input.plan.model, reservationId: input.reconciliation.reservationId,
                actualCost: input.reconciliation.actualCost,
                currencyCode: input.reconciliation.currencyCode,
                pricingRevision: input.plan.pricingRevision,
                correlationId: input.context.correlationId || input.context.requestId
            }
        })).then(() => true).catch(error => ({
            published: false, reason: error.code || 'EVENT_PUBLISH_FAILED'
        }));
    }
};
