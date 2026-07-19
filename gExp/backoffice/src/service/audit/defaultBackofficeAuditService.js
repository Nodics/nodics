/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/service/audit/DefaultBackofficeAuditService
 * @description Records sanitized BackOffice registry, discovery, compatibility, identity, expiry, and store lifecycle audit events.
 * @layer service
 * @owner backoffice
 * @override Projects may persist events through a configured publisher while preserving redaction and failure policy.
 */
module.exports = {
    /** Initializes the BackOffice audit service. */
    init: function () { return Promise.resolve(true); },
    /** Completes BackOffice audit service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective BackOffice audit policy. */
    getConfiguration: function () { return (CONFIG.get('backofficeRegistry') || {}).audit || {}; },
    /** Projects only approved audit fields and runtime-safe timestamps. */
    sanitize: function (event) {
        let source = event || {};
        let sanitized = {};
        ['eventType', 'outcome', 'reasonCode', 'moduleName', 'instanceId', 'moduleCount', 'operation',
            'storeMode', 'compatibilityStatus', 'changeClassification', 'principalId', 'tokenType', 'traceId', 'correlationId', 'requestId']
            .forEach(key => { if (source[key] !== undefined && source[key] !== null) sanitized[key] = source[key]; });
        sanitized.occurredAt = source.occurredAt || new Date().toISOString();
        return sanitized;
    },
    /** Records one sanitized event through logging and an optional governed publisher. */
    record: function (event) {
        let configuration = this.getConfiguration();
        if (configuration.enabled === false) return Promise.resolve(false);
        let sanitized = this.sanitize(event);
        if (this.LOG && this.LOG.info) this.LOG.info('BackOffice audit event', sanitized);
        let publisherName = configuration.publisherService;
        if (publisherName && SERVICE[publisherName] && typeof SERVICE[publisherName].record === 'function') {
            return Promise.resolve(SERVICE[publisherName].record(sanitized));
        }
        return Promise.resolve(sanitized);
    }
};
