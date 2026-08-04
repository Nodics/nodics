/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/operations/DefaultNotifyOperationsService @description Provides safe test-send, provider-account governance, and bounded diagnostics. @layer service @owner notifyCore */
module.exports = {
  /**
   * Initializes the module artifact within the notifyCore-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, flag: function (request) { request._notifyMutationAuthorized = true; return request; }, principal: request => request.authData && (request.authData.principalId || request.authData.code),
  /**
   * Executes the test send operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} input Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  testSend: async function (request, input) { let config = (CONFIG.get('notify') || {}).testSend || {}, environment = request.environmentCode || request.authData.environmentCode || 'unknown', permissions = request.authData && request.authData.permissions || []; if (!permissions.includes('notify.test.send') || config.enabled !== true || !config.environmentAllowlist.includes(environment) || !config.approvedRecipientReferences.includes(input.recipientReference)) throw Object.assign(new Error('Notification test-send policy denied'), { code: 'ERR_NOTIFY_00014' }); if (JSON.stringify(input.values || {}).match(/password|token|credential|secret|cvv|pan|rawPayload|providerPayload/i)) throw Object.assign(new Error('Notification test-send values contain prohibited data'), { code: 'ERR_NOTIFY_00014' }); let result = await SERVICE.DefaultNotifyDeliveryService.send(request, Object.assign({}, input, { idempotencyKey: input.idempotencyKey || ['test', request.authData.principalId || request.authData.code, input.templateCode, input.recipientReference, new Date().toISOString().slice(0, 16)].join(':'), ownerModule: 'notifyCore', ownerReferenceType: 'TEST_SEND', ownerReferenceCode: input.templateCode, correlationId: input.correlationId || 'test-send', testSend: true, environmentCode: environment })); return Object.assign({ testSend: true, environmentCode: environment, secretsExposed: false }, result); },
  /**
   * Executes the manage provider account operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} input Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  manageProviderAccount: async function (request, input) { if (input.secret || input.password || input.token || !input.secretReference) throw Object.assign(new Error('Provider account requires a secret reference and forbids raw credentials'), { code: 'ERR_NOTIFY_00015' }); let actor = this.principal(request); if (input.status === 'ACTIVE' && (!input.approvalEvidence || input.approvalEvidence.approvedByPrincipalId === actor)) throw Object.assign(new Error('Independent provider account approval required'), { code: 'ERR_NOTIFY_00015' }); let model = Object.assign({}, input, { updatedByPrincipalId: actor }), result = input.expectedVersion === undefined ? await SERVICE.DefaultNotifyProviderAccountService.save(this.flag({ tenant: request.tenant, authData: request.authData, model })) : await SERVICE.DefaultNotifyProviderAccountService.update(this.flag({ tenant: request.tenant, authData: request.authData, query: { providerAccountCode: input.providerAccountCode, version: input.expectedVersion }, model: Object.assign(model, { version: Number(input.expectedVersion) + 1 }) })); return result.result || result; },
  /**
   * Executes the diagnostics operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  diagnostics: async function (request) { let enterpriseCode = request.authData.enterpriseCode || request.authData.entCode, since = new Date(Date.now() - 86400000), result = await SERVICE.DefaultNotifyDeliveryRequestService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode, requestedAt: { $gte: since } }, searchOptions: { limit: 500 } }), rows = result && result.result || [], counts = {}; rows.forEach(row => { counts[row.status] = (counts[row.status] || 0) + 1; }); return { windowHours: 24, bounded: rows.length === 500, counts, recovery: { RETRY_SCHEDULED: 'Run an authorized bounded retry or follow the owning Workflow.', FAILED: 'Review normalized attempt code and provider health; never inspect raw content.', SUPPRESSED: 'Review Profile or Customer consent evidence and policy.' } }; },
};
