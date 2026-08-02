/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module payment/interceptors/interceptors @description Payment validation and lifecycle interceptors. @layer interceptor @owner payment */
module.exports = {
    paymentProviderPreSavePolicy: {
        type: 'schema',
        item: 'paymentProvider',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultPaymentPolicyService.prepareProvider',
    },
    paymentTransactionPreSavePolicy: {
        type: 'schema',
        item: 'paymentTransaction',
        trigger: 'preSave',
        active: 'true',
        index: -100,
        handler: 'DefaultPaymentPolicyService.prepareTransaction',
    },
    paymentTransactionPreRemovePolicy: {
        type: 'schema',
        item: 'paymentTransaction',
        trigger: 'preRemove',
        active: 'true',
        index: -100,
        handler: 'DefaultPaymentPolicyService.rejectHardDelete',
    },
};
