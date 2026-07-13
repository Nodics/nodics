/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/interceptors/interceptors
 * @description Schema interceptor registrations for CMS component details, renderer enrichment, and content relationship normalization.
 * @layer interceptor
 * @owner cms
 * @override Project modules may add, reorder, disable, or replace CMS interceptor registrations through later module contributions.
 */
module.exports = {
    // loadComponentSubComponents: {
    //     type: 'schema',
    //     item: 'cmsComponent',
    //     trigger: 'postGet',
    //     active: 'true',
    //     index: 0,
    //     handler: 'DefaultSubComponentsResolveInterceptorService.loadSubCatalogs'
    // },

    generateCmsComponentDetailCode: {
        type: 'schema',
        item: 'cmsComponentDetail',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultCmsComponentDetailInterceptorService.generateCmsComponentDetailCode'
    },
    generateCmsComponentDetailSourceForPage: {
        type: 'schema',
        item: 'cmsPage',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultCmsComponentDetailInterceptorService.setCompDetailSourceForPage'
    },
    generateCmsComponentDetailSourceForComponent: {
        type: 'schema',
        item: 'cmsComponent',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultCmsComponentDetailInterceptorService.setCompDetailSourceForComp'
    },
    loadPageItemRenderer: {
        type: 'schema',
        item: 'cmsPage',
        trigger: 'postGet',
        active: 'true',
        index: 0,
        handler: 'DefaultItemRendererInterceptorService.loadItemRenderer'
    },
    loadComponentItemRenderer: {
        type: 'schema',
        item: 'cmsComponent',
        trigger: 'postGet',
        active: 'true',
        index: 0,
        handler: 'DefaultItemRendererInterceptorService.loadItemRenderer'
    },
};
