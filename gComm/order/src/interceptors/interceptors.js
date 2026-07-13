/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

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
};
