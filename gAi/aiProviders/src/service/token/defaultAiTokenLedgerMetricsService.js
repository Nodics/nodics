/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/src/service/token/defaultAiTokenLedgerMetricsService
 * @description Records sanitized process-local ledger repair counters while persistent records remain audit authority.
 * @layer service
 * @owner aiProviders
 * @override Projects may export these sanitized counters to their observability provider without including prompts or secrets.
 */
const counters = new Map();

module.exports = {
    /** Records one tenant-safe operation result. */
    record: function (operation, result, context) {
        const tenant = String(context && (context.tenant || context.tenantCode) || 'unknown');
        const key = tenant + '|' + operation + '|' + result;
        counters.set(key, Number(counters.get(key) || 0) + 1);
        return true;
    },

    /** Returns sanitized counters, optionally for one tenant. */
    snapshot: function (context) {
        const tenant = context && String(context.tenant || context.tenantCode || '');
        const result = {};
        counters.forEach((count, key) => {
            if (!tenant || key.startsWith(tenant + '|')) result[key] = count;
        });
        return { counters: result, recordedAt: new Date().toISOString() };
    },

    /** Clears process-local counters for focused tests. */
    reset: function () {
        counters.clear();
        return true;
    }
};
