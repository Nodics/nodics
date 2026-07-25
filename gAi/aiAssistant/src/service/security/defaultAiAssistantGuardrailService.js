/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/service/security/DefaultAiAssistantGuardrailService
 * @description Enforces employee identity, tenant ownership, bounded input, and configurable redaction.
 * @layer service
 * @owner aiAssistant
 * @override Projects may add detectors while preserving identity and audit evidence.
 */
module.exports = {
    /** Validates the authenticated employee context used by Assistant persistence. */
    authorize: function (request) {
        const auth = request.authData || {};
        if (!request.tenant || !auth.loginId || auth.principalType !== 'human') {
            const error = new Error('AI Assistant requires an authenticated human employee and tenant');
            error.code = 'ERR_AIA_00000';
            throw error;
        }
        if ((auth.userGroups || []).includes('customerUserGroup')) {
            const error = new Error('AI Assistant is not available to customer identities');
            error.code = 'ERR_AIA_00000';
            throw error;
        }
        return {
            tenantCode: request.tenant,
            principalCode: auth.loginId,
            enterpriseCode: request.enterpriseCode,
            applicationCode: request.applicationCode
        };
    },

    /** Redacts configured sensitive patterns while retaining audit metadata. */
    redact: function (content, configuration) {
        let text = String(content || '');
        const findings = [];
        const patterns = configuration.guardrails && configuration.guardrails.redactionPatterns || [];
        patterns.forEach(pattern => {
            const expression = new RegExp(pattern.expression, pattern.flags || 'gi');
            text = text.replace(expression, match => {
                findings.push({ code: pattern.code, length: match.length });
                return pattern.replacement || '[REDACTED]';
            });
        });
        return { content: text, metadata: { redacted: findings.length > 0, findings: findings } };
    }
};
