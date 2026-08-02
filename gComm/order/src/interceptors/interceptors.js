/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/interceptors/interceptors
 * @description Schema interceptor registrations for order save lifecycle hooks.
 * @layer interceptor
 * @owner order
 * @override Project modules may add, reorder, disable, or replace order interceptor registrations through later module contributions.
 */
module.exports = {
    orderPreSaveEntCode: {
        type: 'schema',
        item: 'order',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultOrderCodeGeneratorInterceptorService.generateEntCode'
    },
    orderPreSaveOrderCode: {
        type: 'schema',
        item: 'order',
        trigger: 'preSave',
        active: 'true',
        index: 1,
        handler: 'DefaultOrderCodeGeneratorInterceptorService.generateOrderCode'
    },
    orderEntryPreSavePolicy: {
        type: 'schema',
        item: 'orderEntry',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderEntryPolicyService.prepareEntry'
    },
    orderEntryPreUpdatePolicy: {
        type: 'schema',
        item: 'orderEntry',
        trigger: 'preUpdate',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderEntryPolicyService.prepareEntryUpdate'
    },
    orderEntryPreRemovePolicy: {
        type: 'schema',
        item: 'orderEntry',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderEntryPolicyService.rejectHardDelete'
    },
    orderDeliveryGroupPreSavePolicy: {
        type: 'schema',
        item: 'orderDeliveryGroup',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderCheckoutAllocationPolicyService.prepareDeliveryGroup'
    },
    orderDeliveryAllocationPreSavePolicy: {
        type: 'schema',
        item: 'orderDeliveryAllocation',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderCheckoutAllocationPolicyService.prepareDeliveryAllocation'
    },
    orderPaymentGroupPreSavePolicy: {
        type: 'schema',
        item: 'orderPaymentGroup',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderCheckoutAllocationPolicyService.preparePaymentGroup'
    },
    orderPaymentAllocationPreSavePolicy: {
        type: 'schema',
        item: 'orderPaymentAllocation',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderCheckoutAllocationPolicyService.preparePaymentAllocation'
    },
    orderDeliveryGroupPreRemovePolicy: {
        type: 'schema',
        item: 'orderDeliveryGroup',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderCheckoutAllocationPolicyService.rejectHardDelete'
    },
    orderDeliveryAllocationPreRemovePolicy: {
        type: 'schema',
        item: 'orderDeliveryAllocation',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderCheckoutAllocationPolicyService.rejectHardDelete'
    },
    orderPaymentGroupPreRemovePolicy: {
        type: 'schema',
        item: 'orderPaymentGroup',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderCheckoutAllocationPolicyService.rejectHardDelete'
    },
    orderPaymentAllocationPreRemovePolicy: {
        type: 'schema',
        item: 'orderPaymentAllocation',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultOrderCheckoutAllocationPolicyService.rejectHardDelete'
    },
};
