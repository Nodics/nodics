/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module product/test/ProductCategoryContract
 * @description Proves Product Category hierarchy, assignment references, ordering, dates, cycles, depth, retirement dependencies, and extension hooks.
 * @layer test
 * @owner product
 * @override Projects may extend Category limits and policies while preserving catalog scope, bounded acyclic hierarchy, and referential integrity.
 */
const assert = require('assert'), configuration = require('../config/properties'), schemas = require('../src/schemas/schemas').product, interceptors = require('../src/interceptors/interceptors');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => configuration[key] }; global.SERVICE = {};
SERVICE.DefaultProductEnterpriseScopeService = require('../src/service/foundation/defaultProductEnterpriseScopeService');
SERVICE.DefaultProductReferenceService = { validate: async () => true };
let categories = [{ enterpriseCode: 'entA', catalogCode: 'retail', categoryCode: 'root', name: 'Root', status: 'ACTIVE' }], assignments = [];
const matches = function (item, query) { return Object.keys(query || {}).every(key => { if (key === 'status' && query[key] && query[key].$ne) return item.status !== query[key].$ne; return item[key] === query[key]; }); };
SERVICE.DefaultProductCategoryService = { get: async request => ({ result: categories.filter(item => matches(item, request.query)) }) };
SERVICE.DefaultProductCategoryAssignmentService = { get: async request => ({ result: assignments.filter(item => matches(item, request.query)) }) };
SERVICE.DefaultProductItemService = { get: async () => ({ result: [{ enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'SKU', itemCode: 'phone', status: 'ACTIVE' }] }) };
SERVICE.DefaultProductCategoryServiceValidator = require('../src/service/foundation/defaultProductCategoryService');
(async () => {
    ['productCategory', 'productCategoryAssignment'].forEach(name => { assert.strictEqual(schemas[name].router.enabled, false); assert(interceptors[name + 'PreSave']); assert(interceptors[name + 'PreUpdate']); assert(interceptors[name + 'PreRemove']); });
    let authData = { enterprise: { code: 'entA' } }, child = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', categoryCode: 'phones', name: 'Phones', parentCategoryCode: 'root', order: 10, status: 'ACTIVE' } };
    await SERVICE.DefaultProductCategoryServiceValidator.prepareCategory(child); assert.strictEqual(child.model.code, 'entA::category::retail::phones');
    let assignment = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', assignmentCode: 'phone-phones', categoryCode: 'root', itemType: 'SKU', itemCode: 'phone', position: 1, status: 'ACTIVE' } };
    await SERVICE.DefaultProductCategoryServiceValidator.prepareAssignment(assignment); assert.strictEqual(assignment.model.code, 'entA::categoryAssignment::retail::phone-phones');
    await assert.rejects(SERVICE.DefaultProductCategoryServiceValidator.prepareCategory({ authData: authData, model: { catalogCode: 'retail', categoryCode: 'self', name: 'Self', parentCategoryCode: 'self' } }), error => error.code === 'ERR_PRODUCT_00015');
    categories.push({ enterpriseCode: 'entA', catalogCode: 'retail', categoryCode: 'cycle-b', name: 'Cycle B', parentCategoryCode: 'cycle-a', status: 'ACTIVE' });
    await assert.rejects(SERVICE.DefaultProductCategoryServiceValidator.prepareCategory({ authData: authData, model: { catalogCode: 'retail', categoryCode: 'cycle-a', name: 'Cycle A', parentCategoryCode: 'cycle-b' } }), error => error.code === 'ERR_PRODUCT_00015');
    await assert.rejects(SERVICE.DefaultProductCategoryServiceValidator.prepareCategory({ authData: authData, model: { catalogCode: 'retail', categoryCode: 'bad-order', name: 'Bad', order: -1 } }), error => error.code === 'ERR_PRODUCT_00014');
    await assert.rejects(SERVICE.DefaultProductCategoryServiceValidator.prepareCategory({ authData: authData, model: { catalogCode: 'retail', categoryCode: 'bad-dates', name: 'Bad', effectiveFrom: '2026-02-01', effectiveTo: '2026-01-01' } }), error => error.code === 'ERR_PRODUCT_00014');
    categories.push({ enterpriseCode: 'entA', catalogCode: 'retail', categoryCode: 'middle', name: 'Middle', parentCategoryCode: 'root', status: 'ACTIVE' }); configuration.product.category.maximumDepth = 1;
    await assert.rejects(SERVICE.DefaultProductCategoryServiceValidator.prepareCategory({ authData: authData, model: { catalogCode: 'retail', categoryCode: 'deep', name: 'Deep', parentCategoryCode: 'middle' } }), error => error.code === 'ERR_PRODUCT_00015'); configuration.product.category.maximumDepth = 32;
    await assert.rejects(SERVICE.DefaultProductCategoryServiceValidator.prepareAssignment({ authData: authData, model: { catalogCode: 'retail', assignmentCode: 'missing', categoryCode: 'missing', itemType: 'SKU', itemCode: 'phone' } }), error => error.code === 'ERR_PRODUCT_00017');
    categories.push({ enterpriseCode: 'entA', catalogCode: 'retail', categoryCode: 'child', name: 'Child', parentCategoryCode: 'root', status: 'ACTIVE' });
    await assert.rejects(SERVICE.DefaultProductCategoryServiceValidator.prepareCategoryUpdate({ tenant: 't1', authData: authData, query: { enterpriseCode: 'entA', catalogCode: 'retail', categoryCode: 'root' }, model: { status: 'RETIRED' } }), error => error.code === 'ERR_PRODUCT_00016');
    categories.filter(item => item.parentCategoryCode === 'root').forEach(item => { item.status = 'RETIRED'; }); assignments.push({ enterpriseCode: 'entA', catalogCode: 'retail', assignmentCode: 'a1', categoryCode: 'root', status: 'ACTIVE' });
    await assert.rejects(SERVICE.DefaultProductCategoryServiceValidator.prepareCategoryUpdate({ tenant: 't1', authData: authData, query: { enterpriseCode: 'entA', catalogCode: 'retail', categoryCode: 'root' }, model: { status: 'RETIRED' } }), error => error.code === 'ERR_PRODUCT_00016');
    assignments[0].status = 'RETIRED'; await SERVICE.DefaultProductCategoryServiceValidator.prepareCategoryUpdate({ tenant: 't1', authData: authData, query: { enterpriseCode: 'entA', catalogCode: 'retail', categoryCode: 'root' }, model: { status: 'RETIRED' } });
    console.log('Product P1.1 Category and assignment contract validated');
})().catch(error => { console.error(error); process.exit(1); });
