/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/service/reconciliation/DefaultStockReconciliationWorkflowService @description Adapts reconciliation findings to existing manual or automatic Nodics workflow actions. @layer service @owner inventory */
module.exports = {
    /** Initializes the adapter. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Resolves layered workflow policy for one finding. */
    policy: function (finding) { let config = ((((CONFIG.get('inventory') || {}).stockReconciliation || {}).workflow) || {}); let mode = (config.findingModes || {})[finding.type] || config.defaultMode || 'MANUAL'; if (!['MANUAL', 'AUTOMATIC'].includes(mode)) throw new CLASSES.NodicsError('ERR_INV_00050', 'Unsupported reconciliation workflow mode'); return { enabled: config.enabled !== false, mode, workflowCode: mode === 'AUTOMATIC' ? config.automaticWorkflowCode : config.manualWorkflowCode }; },
    /** Creates and releases one deterministic carrier for a newly persisted finding. */
    start: async function (finding, request) { let policy = this.policy(finding); if (!policy.enabled || !finding.repairable || !SERVICE.DefaultWorkflowService) return finding; let carrierCode = finding.findingCode + ':workflow'; if (SERVICE.DefaultWorkflowCarrierService && await SERVICE.DefaultWorkflowCarrierService.isCarrierAvailable({ tenant: request.tenant, authData: request.authData, carrierCode })) return Object.assign({}, finding, { workflowCarrierCode: carrierCode }); await SERVICE.DefaultWorkflowService.initCarrier({ tenant: request.tenant, authData: request.authData, workflowCode: policy.workflowCode, releaseCarrier: true, carrier: { code: carrierCode, event: { enabled: true }, sourceDetail: { enterpriseCode: finding.enterpriseCode, findingCode: finding.code, approvalMode: policy.mode }, items: [{ code: finding.code, refId: finding.subjectCode, itemDetail: { type: finding.type, severity: finding.severity } }] } }); return Object.assign({}, finding, { workflowCarrierCode: carrierCode }); },
    /** Extracts governed reconciliation identity from a workflow carrier. */
    context: function (request) { let carrier = request.workflowCarrier || {}; let source = carrier.sourceDetail || {}; if (!carrier.code || !source.findingCode || !['MANUAL', 'AUTOMATIC'].includes(source.approvalMode)) throw new CLASSES.NodicsError('ERR_INV_00050', 'Reconciliation workflow carrier is invalid'); return { carrier, source }; },
    /** Completes a manual or automatic approval action, then delegates repair using the correct identity boundary. */
    complete: async function (request) { let context = this.context(request); let reconciliation = { code: context.source.findingCode, workflowCarrierCode: context.carrier.code, note: 'Approved by reconciliation workflow' }; if (context.source.approvalMode === 'MANUAL') { if (!request.authData || request.authData.tokenType === 'service') throw new CLASSES.NodicsError('ERR_INV_00051', 'Manual workflow action requires human identity'); await SERVICE.DefaultStockReconciliationService.approve({ tenant: request.tenant, authData: request.authData, reconciliation }); await SERVICE.DefaultStockReconciliationInternalClientService.repair({ tenant: request.tenant, reconciliation }); } else { if (!request.authData || request.authData.tokenType !== 'service') throw new CLASSES.NodicsError('ERR_INV_00051', 'Automatic workflow action requires service identity'); await SERVICE.DefaultStockReconciliationService.approveAutomatic({ tenant: request.tenant, authData: request.authData, reconciliation }); await SERVICE.DefaultStockReconciliationService.repair({ tenant: request.tenant, authData: request.authData, reconciliation }); } return { decision: 'SUCCESS', type: 'SUCCESS', feedback: { findingCode: context.source.findingCode, approvalMode: context.source.approvalMode } }; }
};
