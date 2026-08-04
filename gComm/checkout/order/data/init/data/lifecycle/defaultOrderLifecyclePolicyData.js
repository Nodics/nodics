/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module order/data/lifecycle/defaultOrderLifecyclePolicyData @description Default draft policy records for Axis maker-checker management. @layer data @owner order */
module.exports = {
  cancellationWindow: { entCode: 'default', policyCode: 'STANDARD_CANCELLATION', policyType: 'CANCELLATION_WINDOW', scope: { tenant: '*', enterpriseCode: '*', siteCode: '*', channelCode: '*', productType: '*' }, rule: { orderStates: ['PLACED', 'PROCESSING'], fulfillmentStates: ['UNRELEASED', 'RELEASED'], paymentStates: ['UNPAID', 'AUTHORIZED', 'CAPTURED', 'SETTLED'], windowMinutes: 1440 }, status: 'DRAFT', version: 1 },
  returnWindow: { entCode: 'default', policyCode: 'STANDARD_RETURN', policyType: 'RETURN_WINDOW', scope: { productCode: '*', categoryCode: '*', countryCode: '*', customerSegment: '*', channelCode: '*' }, rule: { conditionCodes: ['UNOPENED', 'OPENED', 'DAMAGED'], deliveryAgeDays: 30, warrantyRequired: false }, status: 'DRAFT', version: 1 },
  refundApproval: { entCode: 'default', policyCode: 'STANDARD_REFUND_APPROVAL', policyType: 'APPROVAL', scope: { enterpriseCode: '*', countryCode: '*', paymentMethodCode: '*', riskBand: '*' }, rule: { maximumAutoApprovalAmount: '0', route: 'MANUAL_REVIEW', makerCheckerRequired: true, roles: ['order.refund.approve'] }, status: 'DRAFT', version: 1 },
  evidence: { entCode: 'default', policyCode: 'STANDARD_EVIDENCE', policyType: 'EVIDENCE', scope: { requestType: '*' }, rule: { supportedEvidence: ['IMAGE', 'PACKAGE_CONDITION', 'CARRIER_TRACKING', 'SERIAL_NUMBER', 'INVOICE', 'SUPPORT_NOTE'], maximumAttachmentCount: 10 }, status: 'DRAFT', version: 1 },
};
