/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the root LICENSE. */
const assert = require('assert');
const properties = require('../config/properties');
const graph = require('../src/pipelines/pipelines').notifyCore.notifyMessageDeliveryPipeline;
const pipeline = require('../src/service/pipeline/defaultNotifyDeliveryPipelineService');
const policy = require('../src/service/policy/defaultNotifyPolicyService');
const rate = require('../src/service/policy/defaultNotifyRateLimitService');
const consent = require('../src/service/policy/defaultNotifyConsentEvidenceProviderService');
const templates = require('../src/service/template/defaultNotifyTemplateResolutionService');
const context = require('../src/service/context/defaultNotifyContextResolutionService');
const rendering = require('../src/service/rendering/defaultNotifyRenderingService');
const providers = require('../src/service/provider/defaultNotifyProviderRegistryService');
const persistence = require('../src/service/audit/defaultNotifyDeliveryPersistenceService');
const events = require('../src/service/event/defaultNotifyEventService');

const matches = (row, query) => Object.entries(query || {}).every(([key, expected]) => {
  const actual = row[key];
  if (expected && expected.$in) return Array.isArray(actual) ? actual.some(value => expected.$in.includes(value)) : expected.$in.includes(actual);
  if (expected && expected.$gte) return new Date(actual) >= new Date(expected.$gte);
  return actual === expected;
});
const repository = rows => ({
  get: async request => ({ result: rows.filter(row => matches(row, request.query)).slice(0, request.searchOptions && request.searchOptions.limit || rows.length) }),
  save: async request => { rows.push(Object.assign({}, request.model)); return { result: rows[rows.length - 1] }; },
  update: async request => { const row = rows.find(item => matches(item, request.query)); if (row) Object.assign(row, request.model); return { result: row }; },
});

describe('gNotify persisted business-event runtime journey', function () {
  const originalConfig = global.CONFIG;
  const originalService = global.SERVICE;
  let stores;
  let sends;
  let published;

  beforeEach(function () {
    stores = { policies: [], requests: [], contexts: [], attempts: [], suppressions: [] };
    sends = [];
    published = [];
    global.CONFIG = { get: key => key === 'notify' ? properties.notify : key === 'notifyLocalProvider' ? { enabled: true } : {} };
    const primary = { send: async message => { sends.push(['primary', message.idempotencyKey]); return { status: 'SENT', resultCode: 'PRIMARY_ACCEPTED', providerMessageReference: 'primary-1', safeEvidence: { transport: 'deterministic' } }; } };
    const fallback = { send: async message => { sends.push(['fallback', message.idempotencyKey]); return { status: 'SENT', resultCode: 'FALLBACK_ACCEPTED', providerMessageReference: 'fallback-1', safeEvidence: {} }; } };
    global.SERVICE = {
      DefaultNotifyDeliveryPipelineService: pipeline,
      DefaultNotifyPolicyService: policy,
      DefaultNotifyRateLimitService: rate,
      DefaultNotifyConsentEvidenceProviderService: consent,
      DefaultNotifyTemplateResolutionService: templates,
      DefaultNotifyContextResolutionService: context,
      DefaultNotifyRenderingService: rendering,
      DefaultNotifyProviderRegistryService: providers,
      DefaultNotifyDeliveryPersistenceService: persistence,
      DefaultNotifyEventService: events,
      DefaultNotifyDeliveryPolicyService: repository(stores.policies),
      DefaultNotifyDeliveryRequestService: repository(stores.requests),
      DefaultNotifyMessageContextService: repository(stores.contexts),
      DefaultNotifyDeliveryAttemptService: repository(stores.attempts),
      DefaultNotifyDeliverySuppressionService: repository(stores.suppressions),
      DefaultNotifyTemplateService: { get: async () => ({ result: [{ templateCode: 'order-confirmation', activeVersionCode: 'order-confirmation-v1' }] }) },
      DefaultNotifyTemplateVersionService: { get: async () => ({ result: [{ templateVersionCode: 'order-confirmation-v1', templateCode: 'order-confirmation', status: 'ACTIVE', variableBindings: [], content: { subject: 'Order {{orderCode}}', plainTextBody: 'Hello {{customerName}}' } }] }) },
      DefaultNotifyVariableDefinitionService: { get: async () => ({ result: ['customerName', 'orderCode', 'orderTotal', 'deliveryAddressSummary', 'estimatedDeliveryDate', 'orderDetailsUrl', 'supportContact'].map(variableCode => ({ variableCode, valueType: 'string' })) }) },
      DefaultNotifyProviderService: { get: async () => ({ result: [{ providerCode: 'primary', adapterService: 'PrimaryAdapter', supportedChannels: ['email'], healthStatus: 'UP', status: 'ACTIVE' }, { providerCode: 'fallback', adapterService: 'FallbackAdapter', supportedChannels: ['email'], healthStatus: 'UP', status: 'ACTIVE' }] }) },
      DefaultNotifyProviderAccountService: { get: async () => ({ result: [{ providerAccountCode: 'primary-account', providerCode: 'primary', channelCodes: ['email'], priority: 1, status: 'ACTIVE' }, { providerAccountCode: 'fallback-account', providerCode: 'fallback', channelCodes: ['email'], priority: 2, status: 'ACTIVE' }] }) },
      DefaultProfileCommunicationPreferenceService: { resolve: async () => ({ allowed: true, evidenceCode: 'preference-1' }) },
      DefaultEventService: { publish: async request => published.push(request.event) },
      DefaultOrderLifecycleNotificationResultService: { record: async request => published.push({ ownerResult: request.body.status }) },
      PrimaryAdapter: primary,
      FallbackAdapter: fallback,
    };
    stores.policies.push({ policyCode: 'customer-order-email', tenantCode: 'tenant1', enterpriseCode: 'enterprise1', status: 'ACTIVE', priority: 1, scenarioCodes: ['orderConfirmation'], channelCodes: ['email'], providerCodes: ['primary', 'fallback'], maximumPerWindow: 5, fallbackAllowed: true });
  });
  afterEach(function () { global.CONFIG = originalConfig; global.SERVICE = originalService; });

  const intent = idempotencyKey => ({ idempotencyKey, templateCode: 'order-confirmation', scenarioCode: 'orderConfirmation', channelCode: 'email', messageTypeCode: 'transactional', recipientType: 'CUSTOMER', recipientReference: 'customer:1', maskedRecipient: 'c***@example.invalid', ownerModule: 'order', ownerReferenceType: 'ORDER', ownerReferenceCode: 'order1', correlationId: 'correlation1', values: { customerName: 'Customer', orderCode: 'order1', orderTotal: '100', deliveryAddressSummary: 'Dubai', estimatedDeliveryDate: '2026-08-10', orderDetailsUrl: '/orders/order1', supportContact: 'support' } });
  const execute = async input => {
    const request = { tenant: 'tenant1', authData: { tokenType: 'service', enterpriseCode: 'enterprise1', principalId: 'order-service' }, notifyDelivery: input };
    let nodeName = graph.startNode;
    while (nodeName) {
      const node = graph.nodes[nodeName];
      const method = node.handler.split('.').pop();
      const outcome = await pipeline[method](request);
      if (!outcome || !Object.keys(outcome).length) return outcome;
      const branch = Object.keys(outcome)[0];
      const next = node[branch];
      if (!next) return outcome;
      nodeName = next;
    }
  };

  it('persists policy, rendering evidence, provider attempt, bounded event, and owner result exactly once', async function () {
    const first = await execute(intent('order-event-1'));
    const duplicate = await execute(intent('order-event-1'));
    assert.strictEqual(first.status, 'SENT');
    assert.strictEqual(duplicate.idempotent, true);
    assert.strictEqual(stores.requests.length, 1);
    assert.strictEqual(stores.attempts.length, 1);
    assert.strictEqual(stores.contexts.length, 1);
    assert.strictEqual(sends.length, 1);
    assert.strictEqual(published[0].eventType, 'NOTIFICATION_SENT');
    assert.ok(!JSON.stringify(stores).includes('Hello Customer'));
  });

  it('uses a customer-selected fallback and persists only normalized evidence', async function () {
    global.SERVICE.PrimaryAdapter.send = async message => { sends.push(['primary', message.idempotencyKey]); throw Object.assign(new Error('temporary outage'), { code: 'TEMPORARY_PROVIDER_FAILURE', retryable: true }); };
    const result = await execute(intent('order-event-fallback'));
    assert.strictEqual(result.status, 'SENT');
    assert.deepStrictEqual(sends.map(item => item[0]), ['primary', 'fallback']);
    assert.strictEqual(stores.attempts[0].safeEvidence.fallbackFromProviderCode, 'primary');
  });

  it('persists suppression and provider outage recovery states without transport leakage', async function () {
    global.SERVICE.DefaultProfileCommunicationPreferenceService.resolve = async () => ({ allowed: false, reasonCode: 'CUSTOMER_OPT_OUT', evidenceCode: 'preference-denied' });
    const suppressed = await execute(intent('order-event-suppressed'));
    assert.strictEqual(suppressed.status, 'SUPPRESSED');
    assert.strictEqual(stores.suppressions.length, 1);
    assert.strictEqual(sends.length, 0);
    global.SERVICE.DefaultProfileCommunicationPreferenceService.resolve = async () => ({ allowed: true, evidenceCode: 'preference-1' });
    global.SERVICE.PrimaryAdapter.send = async () => { throw Object.assign(new Error('outage'), { code: 'TEMPORARY_PROVIDER_FAILURE', retryable: true }); };
    global.SERVICE.FallbackAdapter.send = async () => { throw Object.assign(new Error('outage'), { code: 'TEMPORARY_PROVIDER_FAILURE', retryable: true }); };
    const failed = await execute(intent('order-event-outage'));
    assert.strictEqual(failed.status, 'RETRY_SCHEDULED');
    assert.strictEqual(stores.attempts[0].failureCode, 'TEMPORARY_PROVIDER_FAILURE');
    assert.deepStrictEqual(stores.attempts[0].safeEvidence, {});
    assert.strictEqual(stores.attempts[0].message, undefined);
  });
});
