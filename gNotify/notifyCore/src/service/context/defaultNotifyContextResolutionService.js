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
/** @module notifyCore/service/context/DefaultNotifyContextResolutionService @description Resolves allowlisted owner values and creates masked reference-only evidence. @layer service @owner notifyCore */
module.exports = {
  init: function () { return Promise.resolve(true); }, postInit: function () { return Promise.resolve(true); }, items: value => value && Array.isArray(value.result) ? value.result : [],
  forbidden: function (value) { return /password|credential|secret|cvv|pan|providerPayload|rawPayload/i.test(JSON.stringify(value || {})); },
  mask: function (value, rule) { let text = String(value); if (rule === 'EMAIL') { let parts = text.split('@'); return parts.length === 2 ? parts[0].slice(0, 1) + '***@' + parts[1] : '***'; } if (rule === 'MOBILE') return '*'.repeat(Math.max(0, text.length - 4)) + text.slice(-4); return '***'; },
  resolve: async function (request, input, policy, template) { let found = await SERVICE.DefaultNotifyVariableDefinitionService.get({ tenant: request.tenant, authData: request.authData, query: { tenantCode: policy.scope.tenantCode, enterpriseCode: policy.scope.enterpriseCode, scenarioCode: input.scenarioCode, status: 'ACTIVE' }, searchOptions: { limit: 101 } }), definitions = this.items(found); if (definitions.length > 100) throw Object.assign(new Error('Notification variable definition bound exceeded'), { code: 'ERR_NOTIFY_00005' }); let values = Object.assign({}, input.variables || {}, input.values || {}); if (input.valueBuilderService) { let builder = SERVICE[input.valueBuilderService]; if (!builder || typeof builder.resolve !== 'function') throw Object.assign(new Error('Notification value builder unavailable'), { code: 'ERR_NOTIFY_00005' }); values = Object.assign(values, await builder.resolve({ tenant: request.tenant, authData: request.authData, notification: input })); } if (this.forbidden(values)) throw Object.assign(new Error('Notification values contain prohibited data'), { code: 'ERR_NOTIFY_00005' }); let allowed = new Map(definitions.map(item => [item.variableCode, item])), required = new Set([].concat(policy.scenario.requiredVariables || [], template.version.variableBindings || [])); Object.keys(values).forEach(key => { if (!allowed.has(key)) throw Object.assign(new Error('Notification value is not declared: ' + key), { code: 'ERR_NOTIFY_00005' }); }); required.forEach(key => { if (values[key] === undefined || values[key] === null || values[key] === '') throw Object.assign(new Error('Required notification value unavailable: ' + key), { code: 'ERR_NOTIFY_00005' }); }); let evidence = {}, sensitive = []; definitions.forEach(definition => { if (values[definition.variableCode] === undefined) return; if (definition.sensitive || definition.protected) { sensitive.push(definition.variableCode); evidence[definition.variableCode] = { masked: this.mask(values[definition.variableCode], definition.maskingRule), protected: definition.protected === true }; } else evidence[definition.variableCode] = { present: true, type: definition.valueType }; }); return { values, evidence, sensitiveVariableCodes: sensitive }; },
};
