/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
/** @module notifyCore/service/provider/DefaultNotifyProviderRegistryService @description Selects healthy scoped accounts in configured order and supports explicit exclusion for fallback. @layer service @owner notifyCore */
module.exports = {
  /**
   * Initializes the module artifact within the notifyCore-owned layered contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, items: value => value && Array.isArray(value.result) ? value.result : [],
  /**
   * Executes the select operation within the notifyCore-owned layered contract.
   *
   * @param {*} request Value defined by the surrounding Nodics operation contract.
   * @param {*} input Value defined by the surrounding Nodics operation contract.
   * @param {*} policy Value defined by the surrounding Nodics operation contract.
   * @param {*} excludedCodes Value defined by the surrounding Nodics operation contract.
   * @returns {*} The synchronous value or Promise produced by the implementation.
   * @throws Propagates validation, authorization, persistence, or delegated service failures.
   * @override Later project or customer modules may override this exported extension point.
   */
  select: async function (request, input, policy, excludedCodes) { let config = CONFIG.get('notify') || {}, selection = config.providerSelection || {}, excluded = new Set(excludedCodes || []), ordered = [].concat(policy.effectivePolicy && policy.effectivePolicy.providerCodes || (selection.providersByChannel || {})[input.channelCode] || []).filter(code => !excluded.has(code)); if (!ordered.length) throw Object.assign(new Error('No notification provider configured for channel'), { code: 'ERR_NOTIFY_00007' }); let providers = this.items(await SERVICE.DefaultNotifyProviderService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: policy.scope.enterpriseCode, providerCode: { $in: ordered }, status: 'ACTIVE' }, searchOptions: { limit: ordered.length + 1 } })), accounts = this.items(await SERVICE.DefaultNotifyProviderAccountService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: policy.scope.enterpriseCode, providerCode: { $in: ordered }, channelCodes: input.channelCode, status: 'ACTIVE' }, searchOptions: { limit: ordered.length + 1 } })); for (let code of ordered) { let provider = providers.find(item => item.providerCode === code), account = accounts.filter(item => item.providerCode === code).sort((a, b) => Number(a.priority) - Number(b.priority))[0]; if ((!provider || !account) && selection.allowBootstrapAccounts === true) { provider = provider || (selection.bootstrapProviders || {})[code]; account = account || (selection.bootstrapAccounts || {})[code]; } if (!provider || !account || provider.healthStatus === 'DOWN') continue; if (input.testSend === true && (provider.sandboxSupported === false || account.environment !== (input.environmentCode || request.environmentCode || request.authData.environmentCode))) continue; if (!provider.supportedChannels.includes(input.channelCode) || provider.supportedScenarios && provider.supportedScenarios.length && !provider.supportedScenarios.includes(input.scenarioCode)) continue; let adapter = SERVICE[provider.adapterService]; if (adapter && typeof adapter.send === 'function') return { provider, account, adapter }; } throw Object.assign(new Error('No healthy notification provider account is available'), { code: 'ERR_NOTIFY_00007' }); },
};
