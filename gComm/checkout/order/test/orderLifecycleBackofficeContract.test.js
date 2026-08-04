/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module order/test/orderLifecycleBackofficeContract @description Verifies task-focused backend metadata for lifecycle support, approval, policy, reason, and exception workspaces. @layer test @owner order */
const assert = require('assert');
const properties = require('../config/properties');
const contract = require('../../../../gExp/backoffice/src/service/contract/defaultBackofficeContractService');
const navigation = properties.backofficeCapabilities.order.navigation;
assert.strictEqual(contract.validateNavigation(navigation), true);
const byId = new Map(navigation.map(item => [item.id, item]));
['order-cancellations', 'returns', 'order-refunds', 'order-lifecycle-support', 'order-lifecycle-approvals', 'order-lifecycle-exceptions', 'order-lifecycle-policies', 'order-lifecycle-reasons'].forEach(id => assert(byId.has(id), `missing ${id}`));
assert.strictEqual(byId.get('order-lifecycle-support').workbenchTarget.schemaName, 'order');
assert.strictEqual(byId.get('order-lifecycle-support').lifecycleActions.length, 3);
assert(byId.get('order-lifecycle-approvals').lifecycleActions.every(action => action.ownerModule === 'workflow'));
assert(byId.get('order-lifecycle-policies').lifecycleActions.some(action => action.inputFields.some(field => field.type === 'JSON')));
assert.strictEqual(byId.get('order-lifecycle-exceptions').workbenchPresentation.fixedFilters[0].field, 'state');
console.log('Order lifecycle BackOffice contract validated');
