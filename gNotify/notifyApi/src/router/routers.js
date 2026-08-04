/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module notifyApi/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = { notifyApi: { notificationOperations: {
  send: { secured: true, authTokenTypes: ['service'], accessGroups: ['serviceGroup'], permission: 'notify.send', apiExposure: 'internal', key: '/internal/messages', method: 'POST', controller: 'DefaultNotifyController', operation: 'send', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Accepted or suppressed provider-neutral notification' } } },
  createVerification: { secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['userGroup', 'serviceGroup'], permission: 'notify.verification.create', apiExposure: 'controlled', key: '/verification/challenges', method: 'POST', controller: 'DefaultNotifyController', operation: 'createVerification', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Created and delivered challenge without raw OTP' } } },
  validateVerification: { secured: true, authTokenTypes: ['access', 'service'], accessGroups: ['userGroup', 'serviceGroup'], permission: 'notify.verification.validate', apiExposure: 'controlled', key: '/verification/challenges/:challengeCode/validate', method: 'POST', controller: 'DefaultNotifyController', operation: 'validateVerification', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Validated challenge' } } },
  retry: { secured: true, authTokenTypes: ['service'], accessGroups: ['serviceGroup'], permission: 'notify.retry', apiExposure: 'internal', key: '/internal/messages/:requestCode/retry', method: 'POST', controller: 'DefaultNotifyController', operation: 'retry', responses: { 200: { description: 'Executed bounded idempotent retry' } } },
  testSend: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'notify.test.send', apiExposure: 'operations', key: '/operations/test-send', method: 'POST', controller: 'DefaultNotifyController', operation: 'testSend', responses: { 200: { description: 'Executed allowlisted non-production test send' } } },
  manageProviderAccount: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'notify.providerAccount.manage', apiExposure: 'operations', key: '/operations/provider-accounts', method: 'POST', controller: 'DefaultNotifyController', operation: 'manageProviderAccount', responses: { 200: { description: 'Managed secret-reference provider account with maker-checker evidence' } } },
  diagnostics: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'notify.diagnostics.read', apiExposure: 'operations', key: '/operations/diagnostics', method: 'GET', controller: 'DefaultNotifyController', operation: 'diagnostics', responses: { 200: { description: 'Read bounded safe delivery metrics and recovery guidance' } } },
  preview: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'notify.template.preview', apiExposure: 'operations', key: '/operations/templates/preview', method: 'POST', controller: 'DefaultNotifyController', operation: 'preview', responses: { 200: { description: 'Rendered safe sample preview' } } },
  publish: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'notify.template.publish', apiExposure: 'operations', key: '/operations/templates/publish', method: 'POST', controller: 'DefaultNotifyController', operation: 'publish', responses: { 200: { description: 'Published an approved template version' } } },
  retire: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'notify.template.retire', apiExposure: 'operations', key: '/operations/templates/retire', method: 'POST', controller: 'DefaultNotifyController', operation: 'retire', responses: { 200: { description: 'Retired a template' } } },
  rollback: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'notify.template.rollback', apiExposure: 'operations', key: '/operations/templates/rollback', method: 'POST', controller: 'DefaultNotifyController', operation: 'rollback', responses: { 200: { description: 'Rolled back active template version with evidence' } } },
  inbox: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'notify.inapp.read', apiExposure: 'self', key: '/self/inbox', method: 'GET', controller: 'DefaultNotifyController', operation: 'inbox', responses: { 200: { description: 'Read principal-scoped in-app inbox' } } },
  acknowledge: { secured: true, authTokenTypes: ['access'], accessGroups: ['userGroup'], permission: 'notify.inapp.acknowledge', apiExposure: 'self', key: '/self/inbox/:notificationCode/acknowledge', method: 'POST', controller: 'DefaultNotifyController', operation: 'acknowledge', responses: { 200: { description: 'Acknowledged principal-owned in-app item' } } },
} } };
