/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cart/interceptors/interceptors
 * @description Schema interceptor registrations for cart save and load lifecycle hooks.
 * @layer interceptor
 * @owner cart
 * @override Project modules may add, reorder, disable, or replace cart interceptor registrations through later module contributions.
 */
module.exports = {
    cartPreSaveEntCode: {
        type: 'schema',
        item: 'cart',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultCartSchemaInterceptorService.generateEntCode'
    },
    cartPreSaveCartCode: {
        type: 'schema',
        item: 'cart',
        trigger: 'preSave',
        active: 'true',
        index: 1,
        handler: 'DefaultCartCodeGeneratorInterceptorService.generateCartCode'
    },
    cartPostLoadToken: {
        type: 'schema',
        item: 'cart',
        trigger: 'postGet',
        active: 'true',
        index: 1,
        handler: 'defaultCartTokenDetailInterceptorService.loadCartToken'
    },
    cartEntryPreSavePolicy: {
        type: 'schema',
        item: 'cartEntry',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultCartEntryPolicyService.prepareEntry'
    },
    cartEntryPreUpdatePolicy: {
        type: 'schema',
        item: 'cartEntry',
        trigger: 'preUpdate',
        active: 'true',
        index: -100,
        handler: 'DefaultCartEntryPolicyService.prepareEntryUpdate'
    },
    cartEntryPreRemovePolicy: {
        type: 'schema',
        item: 'cartEntry',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultCartEntryPolicyService.rejectHardDelete'
    },
    cartDeliveryGroupPreSavePolicy: {
        type: 'schema',
        item: 'cartDeliveryGroup',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultCartCheckoutAllocationPolicyService.prepareDeliveryGroup'
    },
    cartDeliveryAllocationPreSavePolicy: {
        type: 'schema',
        item: 'cartDeliveryAllocation',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultCartCheckoutAllocationPolicyService.prepareDeliveryAllocation'
    },
    cartPaymentGroupPreSavePolicy: {
        type: 'schema',
        item: 'cartPaymentGroup',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultCartCheckoutAllocationPolicyService.preparePaymentGroup'
    },
    cartPaymentAllocationPreSavePolicy: {
        type: 'schema',
        item: 'cartPaymentAllocation',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultCartCheckoutAllocationPolicyService.preparePaymentAllocation'
    },
    cartDeliveryGroupPreRemovePolicy: {
        type: 'schema',
        item: 'cartDeliveryGroup',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultCartCheckoutAllocationPolicyService.rejectHardDelete'
    },
    cartDeliveryAllocationPreRemovePolicy: {
        type: 'schema',
        item: 'cartDeliveryAllocation',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultCartCheckoutAllocationPolicyService.rejectHardDelete'
    },
    cartPaymentGroupPreRemovePolicy: {
        type: 'schema',
        item: 'cartPaymentGroup',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultCartCheckoutAllocationPolicyService.rejectHardDelete'
    },
    cartPaymentAllocationPreRemovePolicy: {
        type: 'schema',
        item: 'cartPaymentAllocation',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultCartCheckoutAllocationPolicyService.rejectHardDelete'
    },
};
