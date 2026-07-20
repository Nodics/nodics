/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

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
    validateCmsRendererMapping: {
        type: 'schema', item: 'cmsTypeCode2Renderer', trigger: 'preSave', active: 'true', index: 0,
        handler: 'DefaultCmsContractValidationService.validateRenderer'
    },
    validateCmsPageTemplate: {
        type: 'schema', item: 'cmsPageTemplate', trigger: 'preSave', active: 'true', index: 0,
        handler: 'DefaultCmsContractValidationService.validateRenderer'
    },
    validateCmsPageRoute: {
        type: 'schema', item: 'cmsPageRoute', trigger: 'preSave', active: 'true', index: 0,
        handler: 'DefaultCmsContractValidationService.validateRoute'
    },
    validateCmsComponentAssociation: {
        type: 'schema', item: 'cmsComponentDetail', trigger: 'preSave', active: 'true', index: 10,
        handler: 'DefaultCmsContractValidationService.validateAssociation'
    },
    invalidateCmsPageDeliveryAfterSave: { type: 'schema', item: 'cmsPage', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsPageDeliveryAfterUpdate: { type: 'schema', item: 'cmsPage', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsPageDeliveryAfterRemove: { type: 'schema', item: 'cmsPage', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsRouteDeliveryAfterSave: { type: 'schema', item: 'cmsPageRoute', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsRouteDeliveryAfterUpdate: { type: 'schema', item: 'cmsPageRoute', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsRouteDeliveryAfterRemove: { type: 'schema', item: 'cmsPageRoute', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsComponentDeliveryAfterSave: { type: 'schema', item: 'cmsComponent', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsComponentDeliveryAfterUpdate: { type: 'schema', item: 'cmsComponent', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsComponentDeliveryAfterRemove: { type: 'schema', item: 'cmsComponent', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsAssociationDeliveryAfterSave: { type: 'schema', item: 'cmsComponentDetail', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsAssociationDeliveryAfterUpdate: { type: 'schema', item: 'cmsComponentDetail', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsAssociationDeliveryAfterRemove: { type: 'schema', item: 'cmsComponentDetail', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
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
