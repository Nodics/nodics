/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module pricing/interceptors/interceptors @description Pricing isolation, validation, immutability, and cache invalidation hooks. @layer interceptor @owner pricing */
const scoped = function (schema, prepare, update) { let result = {}; result[schema + 'PreSave'] = { type: 'schema', item: schema, trigger: 'preSave', active: 'true', index: -100, handler: prepare }; result[schema + 'PreGet'] = { type: 'schema', item: schema, trigger: 'preGet', active: 'true', index: -100, handler: 'DefaultPricingEnterpriseScopeService.scopeQuery' }; result[schema + 'PreUpdate'] = { type: 'schema', item: schema, trigger: 'preUpdate', active: 'true', index: -100, handler: update }; result[schema + 'PreRemove'] = { type: 'schema', item: schema, trigger: 'preRemove', active: 'true', index: -100, handler: 'DefaultPricingValidationService.rejectHardDelete' }; result[schema + 'PostSaveInvalidate'] = { type: 'schema', item: schema, trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultPriceResolutionCacheService.invalidate' }; result[schema + 'PostUpdateInvalidate'] = { type: 'schema', item: schema, trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultPriceResolutionCacheService.invalidate' }; return result; };
module.exports = Object.assign({}, scoped('priceList', 'DefaultPricingValidationService.preparePriceList', 'DefaultPricingValidationService.preparePriceListUpdate'), scoped('priceListAssignment', 'DefaultPricingValidationService.prepareAssignmentWithReferences', 'DefaultPricingValidationService.prepareAssignmentUpdate'), scoped('priceGroup', 'DefaultPricingValidationService.prepareGroup', 'DefaultPricingValidationService.prepareGroupUpdate'), scoped('priceGroupMember', 'DefaultPricingValidationService.prepareMembershipWithReferences', 'DefaultPricingValidationService.prepareMembershipUpdate'), scoped('price', 'DefaultPricingValidationService.preparePriceWithReferences', 'DefaultPricingValidationService.preparePriceUpdate'));
