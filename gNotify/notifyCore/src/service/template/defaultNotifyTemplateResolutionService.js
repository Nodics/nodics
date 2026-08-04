/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/*
 * Nodics - Enterprise Micro-Services Management Framework
 * Copyright (c) 2026 Nodics. All rights reserved.
 * Governed by the root Nodics Source-Available Commercial License.
 */
/** @module notifyCore/service/template/DefaultNotifyTemplateResolutionService @description Resolves one active scoped template version with locale fallback. @layer service @owner notifyCore */
module.exports = {
  /**
   * Initializes the module artifact within the notifyCore-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, items: value => value && Array.isArray(value.result) ? value.result : [],
  /**
   * Resolves the module artifact within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} input Value defined by the surrounding Nodics operation contract.
   * @param {*} policy Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  resolve: async function (request, input, policy) { let config = CONFIG.get('notify') || {}, locale = input.locale || 'default', fallbacks = [locale].concat((config.rendering.localeFallbacks || {})[locale] || ['default']); for (let candidate of fallbacks) { let query = { tenantCode: policy.scope.tenantCode, enterpriseCode: policy.scope.enterpriseCode, channelCode: input.channelCode, scenarioCode: input.scenarioCode, messageTypeCode: input.messageTypeCode, locale: candidate, status: 'ACTIVE' }; if (input.siteCode) query.siteCode = { $in: [input.siteCode, null] }; if (input.templateCode) query.templateCode = input.templateCode; let found = await SERVICE.DefaultNotifyTemplateService.get({ tenant: request.tenant, authData: request.authData, query, searchOptions: { limit: 2, sort: { version: -1 } } }), templates = this.items(found); if (templates.length > 1) throw Object.assign(new Error('Ambiguous active notification template'), { code: 'ERR_NOTIFY_00004' }); if (templates.length === 1) { let template = templates[0], versionFound = await SERVICE.DefaultNotifyTemplateVersionService.get({ tenant: request.tenant, authData: request.authData, query: { templateVersionCode: template.activeVersionCode, templateCode: template.templateCode, status: 'ACTIVE' }, searchOptions: { limit: 1 } }), versions = this.items(versionFound); if (versions.length !== 1) throw Object.assign(new Error('Active notification template version unavailable'), { code: 'ERR_NOTIFY_00004' }); return { template, version: versions[0], locale: candidate }; } } throw Object.assign(new Error('Notification template unavailable'), { code: 'ERR_NOTIFY_00004' }); },
};
