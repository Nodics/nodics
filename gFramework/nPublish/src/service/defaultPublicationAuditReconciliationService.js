/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nPublish/service/DefaultPublicationAuditReconciliationService
 * @description Rebuilds missing audit projections from the tenant-scoped authoritative publication journals.
 * @layer service
 * @owner nPublish
 * @override Projects may replace batch selection or observability while preserving journal authority, idempotency, and tenant isolation.
 */
module.exports = {
    /** Initializes publication audit reconciliation. */
    init: function () { return Promise.resolve(true); },
    /** Completes publication audit reconciliation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective bounded reconciliation configuration. */
    getConfiguration: function () { return (CONFIG.get('publish') || {}).reconciliation || {}; },
    /** Resolves the configured publication repository provider. */
    getRepository: function () {
        let reference = ((CONFIG.get('publish') || {}).providers || {}).repositoryProvider;
        let repository = reference && typeof reference === 'object' ? reference : SERVICE[reference];
        if (!repository) throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication repository provider is unavailable');
        return repository;
    },
    /** Builds the deterministic projection identity for one authoritative journal entry. */
    getAuditCode: function (entry) {
        return entry.publicationCode + '_' + entry.revision + '_' + entry.toState;
    },
    /** Reconciles one bounded tenant-scoped batch without mutating publication state or journals. */
    reconcile: async function (request) {
        request = request || {};
        let config = this.getConfiguration();
        let batchSize = Math.max(1, Math.min(Number(request.batchSize || config.batchSize || 100), 1000));
        let maxDurationMs = Math.max(1, Number(request.maxDurationMs || config.maxDurationMs || 5000));
        let startedAt = Date.now();
        let repository = this.getRepository();
        let publications = await repository.list(request, request.publicationCode ? 1 : batchSize);
        let summary = { scanned: 0, journalEntries: 0, missing: 0, restored: 0, failed: 0, timedOut: false, failures: [] };
        for (let publication of publications) {
            if (Date.now() - startedAt >= maxDurationMs) { summary.timedOut = true; break; }
            summary.scanned++;
            let entries = Array.isArray(publication.auditTrail) ? publication.auditTrail : [];
            summary.journalEntries += entries.length;
            let existing = await repository.getAuditCodes(publication.code, request);
            for (let entry of entries) {
                if (Date.now() - startedAt >= maxDurationMs) { summary.timedOut = true; break; }
                if (existing.has(this.getAuditCode(entry))) continue;
                summary.missing++;
                try {
                    await repository.appendAudit(entry, request);
                    existing.add(this.getAuditCode(entry));
                    summary.restored++;
                } catch (error) {
                    summary.failed++;
                    summary.failures.push({ publicationCode: publication.code, revision: entry.revision,
                        errorCode: error && (error.code || error.name) || 'RECONCILIATION_FAILED' });
                }
            }
            if (summary.timedOut) break;
        }
        summary.durationMs = Date.now() - startedAt;
        return summary;
    }
};
