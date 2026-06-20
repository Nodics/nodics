/**
 * @module service/audit/DefaultAuthAuditService
 * @description Records sanitized authentication lifecycle events without
 * credentials. Project and environment modules may override this service to
 * persist events in a SIEM, audit database, or governed event stream.
 * @layer service
 * @owner nAuth
 * @override Preserve the `record(event)` promise contract and never persist
 * passwords, bearer tokens, refresh tokens, or API keys.
 */
module.exports = {
    sanitize: function (event) {
        let source = event || {};
        let sanitized = {};
        [
            'eventType', 'outcome', 'tenant', 'entCode', 'principalId',
            'tokenType', 'reasonCode', 'traceId', 'correlationId', 'requestId',
            'source', 'remoteAddress'
        ].forEach(key => {
            if (source[key] !== undefined && source[key] !== null) sanitized[key] = source[key];
        });
        sanitized.occurredAt = source.occurredAt || new Date().toISOString();
        sanitized.nodeId = source.nodeId || CONFIG.get('nodeId');
        return sanitized;
    },

    record: function (event) {
        let auditConfiguration = CONFIG.get('authSecurity') && CONFIG.get('authSecurity').audit || {};
        if (auditConfiguration.enabled === false) return Promise.resolve(false);
        let sanitized = this.sanitize(event);
        this.LOG.info('Authentication audit event', sanitized);
        let publisherName = auditConfiguration.publisherService;
        if (publisherName && SERVICE[publisherName] && typeof SERVICE[publisherName].record === 'function') {
            return Promise.resolve(SERVICE[publisherName].record(sanitized));
        }
        return Promise.resolve(sanitized);
    }
};
