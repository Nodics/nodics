/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/interceptors @description Enforces Product enterprise scope, validation, immutable identity, and retained history. @layer interceptor @owner product */
const scoped = function (schema, prepare, update) { let result = {}; result[schema + 'PreSave'] = { type: 'schema', item: schema, trigger: 'preSave', active: 'true', index: -100, handler: prepare }; result[schema + 'PreGet'] = { type: 'schema', item: schema, trigger: 'preGet', active: 'true', index: -100, handler: 'DefaultProductEnterpriseScopeService.scopeQuery' }; result[schema + 'PreUpdate'] = { type: 'schema', item: schema, trigger: 'preUpdate', active: 'true', index: -100, handler: update }; result[schema + 'PreRemove'] = { type: 'schema', item: schema, trigger: 'preRemove', active: 'true', index: -100, handler: 'DefaultProductFoundationService.rejectHardDelete' }; return result; };
module.exports = Object.assign({},
    scoped('productItem', 'DefaultProductFoundationService.prepareItem', 'DefaultProductFoundationService.prepareItemUpdate'),
    scoped('productIdentifier', 'DefaultProductFoundationService.prepareIdentifier', 'DefaultProductFoundationService.prepareIdentifierUpdate'),
    scoped('productCategory', 'DefaultProductCategoryService.prepareCategory', 'DefaultProductCategoryService.prepareCategoryUpdate'),
    scoped('productCategoryAssignment', 'DefaultProductCategoryService.prepareAssignment', 'DefaultProductCategoryService.prepareAssignmentUpdate'),
    scoped('productAttributeDefinition', 'DefaultProductClassificationService.prepareDefinition', 'DefaultProductClassificationService.prepareDefinitionUpdate'),
    scoped('productAttributeValue', 'DefaultProductClassificationService.prepareValue', 'DefaultProductClassificationService.prepareValueUpdate'),
    scoped('productClassificationClass', 'DefaultProductClassificationService.prepareClass', 'DefaultProductClassificationService.prepareClassUpdate'),
    scoped('productClassificationAssignment', 'DefaultProductClassificationService.prepareClassAssignment', 'DefaultProductClassificationService.prepareClassAssignmentUpdate'),
    scoped('productVariantAxis', 'DefaultProductVariantService.prepareAxis', 'DefaultProductVariantService.prepareAxisUpdate'),
    scoped('productVariantAssignment', 'DefaultProductVariantService.prepareAssignment', 'DefaultProductVariantService.prepareAssignmentUpdate'),
    scoped('productRelation', 'DefaultProductCompositionService.prepareRelation', 'DefaultProductCompositionService.prepareRelationUpdate'),
    scoped('productBundleEntry', 'DefaultProductCompositionService.prepareBundleEntry', 'DefaultProductCompositionService.prepareBundleEntryUpdate'),
    scoped('productPackaging', 'DefaultProductCompositionService.preparePackaging', 'DefaultProductCompositionService.preparePackagingUpdate'),
    scoped('productMediaReference', 'DefaultProductCompositionService.prepareMedia', 'DefaultProductCompositionService.prepareMediaUpdate'));
