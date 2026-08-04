/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module complianceCore/src/utils/enums
 * @description Enum definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    ComplianceDecisionCode: {
        definition: ['APPROVED', 'REJECTED', 'INCONCLUSIVE', 'REVIEW_REQUIRED', 'EXPIRED']
    },
    ComplianceAuditActionCode: {
        definition: [
            'SUBMITTED', 'SENSITIVE_READ', 'MEDIA_DELIVERED', 'PROVIDER_EXECUTED',
            'PROVIDER_CALLBACK', 'REVIEW_ACTIONED', 'DECIDED', 'ELIGIBILITY_EVALUATED',
            'POLICY_CHANGED', 'PROVIDER_CHANGED', 'RETENTION_ACTIONED',
            'LEGAL_HOLD_CHANGED', 'DELETION_ACTIONED', 'RETRIED', 'FAILED', 'RECOVERED'
        ]
    },
    ComplianceRetentionAction: {
        definition: ['RETAIN', 'HOLD', 'DELETE_ELIGIBLE']
    }
};
