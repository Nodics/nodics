/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
};
