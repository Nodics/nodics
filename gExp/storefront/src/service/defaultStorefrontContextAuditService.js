/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/service/DefaultStorefrontContextAuditService
 * @description Records and optionally publishes sanitized Storefront context lifecycle evidence through existing Nodics audit and event authorities.
 * @layer service
 * @owner storefront
 * @override Projects may replace evidence delivery while preserving redaction, tenant isolation, bounded fields, and fail-open telemetry behavior.
 */
module.exports = {
    _metrics: { recorded: 0, publisherSuccesses: 0, publisherFailures: 0, eventSuccesses: 0, eventFailures: 0 },
    /** Initializes Storefront context audit handling. */
    init: function () { return Promise.resolve(true); },
    /** Completes Storefront context audit initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns layered context-audit policy. */
    policy: function () { return ((CONFIG.get('storefront') || {}).contextAccess || {}).audit || {}; },
    /** Projects only explicitly approved evidence fields and never accepts bearer material. */
    sanitize: function (event) {
        let source = event || {}, result = {};
        ['eventType', 'outcome', 'reasonCode', 'operation', 'actorType', 'principalId', 'tokenType',
            'tenantCode', 'enterpriseCode', 'storefrontCode', 'audience', 'requestId', 'traceId', 'correlationId']
            .forEach(key => { if (source[key] !== undefined && source[key] !== null && source[key] !== '') result[key] = String(source[key]).slice(0, 256); });
        result.occurredAt = source.occurredAt || new Date().toISOString();
        return result;
    },
    /** Records one audit envelope and delegates optional persistence and NEMS publication without affecting the security operation. */
    record: async function (event) {
        let policy = this.policy();
        if (policy.enabled === false) return false;
        let sanitized = this.sanitize(event);
        this._metrics.recorded += 1;
        if (this.LOG && this.LOG.info) this.LOG.info('Storefront context lifecycle audit event', sanitized);
        let publisher = policy.publisherService && SERVICE[policy.publisherService];
        if (publisher && typeof publisher.record === 'function') {
            try { await publisher.record(sanitized); this._metrics.publisherSuccesses += 1; }
            catch (error) { this._metrics.publisherFailures += 1; this.warn('STOREFRONT_CONTEXT_AUDIT_PUBLISH_FAILED'); }
        }
        let events = policy.events || {}, eventPublisher = SERVICE[events.publisherService || 'DefaultEventService'];
        if (events.enabled === true && eventPublisher && typeof eventPublisher.publish === 'function') {
            try {
                await eventPublisher.publish({ tenant: sanitized.tenantCode || ((CONFIG.get('storefront') || {}).contextResolution || {}).defaultTenant || 'default',
                    active: true, event: events.eventName || 'storefront.context.lifecycle', sourceName: 'storefront',
                    sourceId: typeof NODICS !== 'undefined' && NODICS.getNodeName ? NODICS.getNodeName() || 'default' : 'default',
                    target: events.target || 'storefront', state: 'NEW', type: events.type || 'ASYNC',
                    targetType: typeof ENUMS !== 'undefined' && ENUMS.TargetType && ENUMS.TargetType.MODULE ? ENUMS.TargetType.MODULE.key : 'MODULE',
                    data: sanitized });
                this._metrics.eventSuccesses += 1;
            } catch (error) { this._metrics.eventFailures += 1; this.warn('STOREFRONT_CONTEXT_EVENT_PUBLISH_FAILED'); }
        }
        return sanitized;
    },
    /** Emits only a stable delivery-failure code. */
    warn: function (code) { if (this.LOG && this.LOG.warn) this.LOG.warn('Storefront context evidence delivery failed', { code: code }); },
    /** Returns detached low-cardinality audit-delivery counters. */
    diagnostics: function () { return Object.assign({}, this._metrics); }
};
