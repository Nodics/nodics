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
const schemas = require('../../notifySchema/src/schemas/schemas');
const routes = require('../../notifyApi/src/router/routers');
const pipelines = require('../src/pipelines/pipelines');
const listeners = require('../src/event/listeners');
describe('gNotify architecture and Axis contract', function () {
  it('publishes all governed private models without a second consent authority', function () { let models = Object.keys(schemas.notifySchema); assert.strictEqual(models.length, 14); assert.ok(models.includes('notifyDeliveryRequest')); assert.ok(models.includes('notifyVerificationChallenge')); assert.ok(!models.includes('notifyConsent')); Object.values(schemas.notifySchema).forEach(schema => assert.strictEqual(schema.router.enabled, false)); });
  it('keeps channel, scenario, type, provider and template concerns separate', function () { let notify = properties.notify; assert.ok(notify.channels.email && notify.channels.sms && notify.channels.inApp); assert.strictEqual(notify.scenarios.orderConfirmation.ownerModule, 'order'); assert.strictEqual(notify.messageTypes.marketing.consentRequired, true); assert.strictEqual(notify.providerSelection.bootstrapProviders.localNotify.adapterService, 'DefaultLocalNotifyProviderAdapterService'); });
  it('advertises backend-driven Axis workspaces', function () { let capability = properties.backofficeCapabilities.notify; assert.strictEqual(capability.displayName, 'Notifications & Messaging'); let names = capability.navigation.map(item => item.workbenchTarget.schemaName); ['notifyTemplate', 'notifyScenario', 'notifyChannel', 'notifyProvider', 'notifyDeliveryRequest', 'notifyDeliverySuppression', 'notifyVerificationChallenge'].forEach(name => assert.ok(names.includes(name))); });
  it('secures every custom route and keeps internal send service-only', function () { let operations = routes.notifyApi.notificationOperations; Object.values(operations).forEach(route => assert.strictEqual(route.secured, true)); assert.deepStrictEqual(operations.send.authTokenTypes, ['service']); assert.ok(operations.preview.permission); assert.ok(operations.inbox.permission); });
  it('uses pipelines for technical delivery and event listeners for owner intents', function () { assert.strictEqual(pipelines.notifyCore.notifyMessageDeliveryPipeline.startNode, 'validateRequest'); assert.ok(pipelines.notifyCore.notifyMessageDeliveryPipeline.nodes.persistAttempt); assert.ok(listeners.notifyCore.orderLifecycleNotificationIntent); assert.ok(listeners.notifyCore.workflowTaskNotificationIntent); });
  it('makes high-risk and verification controls configuration-first', function () { let notify = properties.notify; assert.strictEqual(notify.verification.providerManagedEnabled, false); assert.ok(notify.abuse.otpCooldownMs); assert.strictEqual(notify.lifecycle.makerCheckerRequired, true); assert.strictEqual(notify.rendering.previewProtectedSamples.otpCode, '123456'); });
});
