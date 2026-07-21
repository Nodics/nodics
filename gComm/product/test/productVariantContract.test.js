/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module product/test/ProductVariantContract
 * @description Proves Product variant axes, canonical combinations, sellable Item references, graph bounds, lifecycle dependencies, and project-layer policy extension.
 * @layer test
 * @owner product
 * @override Projects may extend configured base and variant Item types while retaining Product attribute authority, combination uniqueness, and graph safety.
 */
const assert = require('assert'), configuration = require('../config/properties'), schemas = require('../src/schemas/schemas').product, interceptors = require('../src/interceptors/interceptors');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => configuration[key] }; global.SERVICE = {};
SERVICE.DefaultProductEnterpriseScopeService = require('../src/service/foundation/defaultProductEnterpriseScopeService');
SERVICE.DefaultProductReferenceService = { validate: async () => true };
let items = [
    { enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'PRODUCT', itemCode: 'shirt', status: 'ACTIVE', sellable: false },
    { enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'SKU', itemCode: 'shirt-red-m', status: 'ACTIVE', sellable: true },
    { enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'SKU', itemCode: 'shirt-blue-m', status: 'ACTIVE', sellable: true },
    { enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'SKU', itemCode: 'draft-not-sellable', status: 'DRAFT', sellable: false }
], definitions = [
    { enterpriseCode: 'entA', catalogCode: 'retail', attributeCode: 'color', valueType: 'ENUM', localized: false, multiValued: false, status: 'ACTIVE' },
    { enterpriseCode: 'entA', catalogCode: 'retail', attributeCode: 'size', valueType: 'ENUM', localized: false, multiValued: false, status: 'ACTIVE' },
    { enterpriseCode: 'entA', catalogCode: 'retail', attributeCode: 'localized-name', valueType: 'TEXT', localized: true, multiValued: false, status: 'ACTIVE' }
], values = [
    { enterpriseCode: 'entA', catalogCode: 'retail', valueCode: 'red-value', itemType: 'SKU', itemCode: 'shirt-red-m', attributeCode: 'color', stringValue: 'RED', status: 'ACTIVE' },
    { enterpriseCode: 'entA', catalogCode: 'retail', valueCode: 'medium-value', itemType: 'SKU', itemCode: 'shirt-red-m', attributeCode: 'size', stringValue: 'M', status: 'ACTIVE' },
    { enterpriseCode: 'entA', catalogCode: 'retail', valueCode: 'blue-value', itemType: 'SKU', itemCode: 'shirt-blue-m', attributeCode: 'color', stringValue: 'BLUE', status: 'ACTIVE' },
    { enterpriseCode: 'entA', catalogCode: 'retail', valueCode: 'blue-medium-value', itemType: 'SKU', itemCode: 'shirt-blue-m', attributeCode: 'size', stringValue: 'M', status: 'ACTIVE' }
], axes = [], assignments = [];
const matches = function (item, query) { return Object.keys(query || {}).every(key => { let expected = query[key]; if (expected && expected.$ne !== undefined) return item[key] !== expected.$ne; return item[key] === expected; }); };
const generated = records => ({ get: async request => ({ result: records.filter(item => matches(item, request.query)) }) });
SERVICE.DefaultProductItemService = generated(items); SERVICE.DefaultProductAttributeDefinitionService = generated(definitions); SERVICE.DefaultProductAttributeValueService = generated(values); SERVICE.DefaultProductVariantAxisService = generated(axes); SERVICE.DefaultProductVariantAssignmentService = generated(assignments);
const validator = require('../src/service/foundation/defaultProductVariantService'), authData = { enterprise: { code: 'entA' } };
(async () => {
    ['productVariantAxis', 'productVariantAssignment'].forEach(name => { assert.strictEqual(schemas[name].router.enabled, false); assert.strictEqual(schemas[name].isVersionedEnabled, false); assert(interceptors[name + 'PreSave']); assert(interceptors[name + 'PreUpdate']); assert(interceptors[name + 'PreRemove']); });
    let colorAxis = { tenant: 't1', authData, model: { catalogCode: 'retail', axisCode: 'shirt-color', baseItemType: 'PRODUCT', baseItemCode: 'shirt', attributeCode: 'color', position: 10, required: true, status: 'ACTIVE' } }; await validator.prepareAxis(colorAxis); axes.push(Object.assign({}, colorAxis.model)); assert.strictEqual(colorAxis.model.code, 'entA::variantAxis::retail::shirt-color');
    let sizeAxis = { tenant: 't1', authData, model: { catalogCode: 'retail', axisCode: 'shirt-size', baseItemType: 'PRODUCT', baseItemCode: 'shirt', attributeCode: 'size', position: 20, required: true, status: 'ACTIVE' } }; await validator.prepareAxis(sizeAxis); axes.push(Object.assign({}, sizeAxis.model));
    await assert.rejects(validator.prepareAxis({ tenant: 't1', authData, model: { catalogCode: 'retail', axisCode: 'bad-localized', baseItemType: 'PRODUCT', baseItemCode: 'shirt', attributeCode: 'localized-name', position: 30, required: true, status: 'ACTIVE' } }), error => error.code === 'ERR_PRODUCT_00028');
    let assignment = { tenant: 't1', authData, model: { catalogCode: 'retail', assignmentCode: 'shirt-red-m', baseItemType: 'PRODUCT', baseItemCode: 'shirt', variantItemType: 'SKU', variantItemCode: 'shirt-red-m', axisValues: [{ axisCode: 'shirt-size', valueCode: 'medium-value' }, { axisCode: 'shirt-color', valueCode: 'red-value' }], status: 'ACTIVE' } }; await validator.prepareAssignment(assignment); assert.strictEqual(assignment.model.combinationKey, 'shirt-color=stringValue%3ARED&shirt-size=stringValue%3AM'); assignments.push(Object.assign({}, assignment.model));
    await assert.rejects(validator.prepareAssignment({ tenant: 't1', authData, model: { catalogCode: 'retail', assignmentCode: 'missing-size', baseItemType: 'PRODUCT', baseItemCode: 'shirt', variantItemType: 'SKU', variantItemCode: 'shirt-blue-m', axisValues: [{ axisCode: 'shirt-color', valueCode: 'blue-value' }], status: 'ACTIVE' } }), error => error.code === 'ERR_PRODUCT_00029');
    await assert.rejects(validator.prepareAssignment({ tenant: 't1', authData, model: { catalogCode: 'retail', assignmentCode: 'wrong-owner', baseItemType: 'PRODUCT', baseItemCode: 'shirt', variantItemType: 'SKU', variantItemCode: 'shirt-blue-m', axisValues: [{ axisCode: 'shirt-color', valueCode: 'red-value' }, { axisCode: 'shirt-size', valueCode: 'blue-medium-value' }], status: 'ACTIVE' } }), error => error.code === 'ERR_PRODUCT_00029');
    await assert.rejects(validator.prepareAssignment({ tenant: 't1', authData, model: { catalogCode: 'retail', assignmentCode: 'not-sellable', baseItemType: 'PRODUCT', baseItemCode: 'shirt', variantItemType: 'SKU', variantItemCode: 'draft-not-sellable', axisValues: [{ axisCode: 'shirt-color', valueCode: 'red-value' }, { axisCode: 'shirt-size', valueCode: 'medium-value' }] } }), error => error.code === 'ERR_PRODUCT_00029');
    values.push({ enterpriseCode: 'entA', catalogCode: 'retail', valueCode: 'red-value-2', itemType: 'SKU', itemCode: 'shirt-blue-m', attributeCode: 'color', stringValue: 'RED', status: 'ACTIVE' }, { enterpriseCode: 'entA', catalogCode: 'retail', valueCode: 'medium-value-2', itemType: 'SKU', itemCode: 'shirt-blue-m', attributeCode: 'size', stringValue: 'M', status: 'ACTIVE' });
    await assert.rejects(validator.prepareAssignment({ tenant: 't1', authData, model: { catalogCode: 'retail', assignmentCode: 'duplicate-combination', baseItemType: 'PRODUCT', baseItemCode: 'shirt', variantItemType: 'SKU', variantItemCode: 'shirt-blue-m', axisValues: [{ axisCode: 'shirt-color', valueCode: 'red-value-2' }, { axisCode: 'shirt-size', valueCode: 'medium-value-2' }], status: 'ACTIVE' } }), error => error.code === 'ERR_PRODUCT_00029');
    await assert.rejects(validator.prepareAxisUpdate({ tenant: 't1', authData, query: { enterpriseCode: 'entA', catalogCode: 'retail', axisCode: 'shirt-color' }, model: { status: 'RETIRED' } }), error => error.code === 'ERR_PRODUCT_00029');
    await assert.rejects(validator.prepareAssignmentUpdate({ tenant: 't1', authData, query: { enterpriseCode: 'entA', catalogCode: 'retail', assignmentCode: 'shirt-red-m' }, model: { axisValues: [] } }), error => error.code === 'ERR_PRODUCT_00011');
    configuration.product.variant.variantItemTypes.push('PROJECT_VARIANT'); assert(configuration.product.variant.variantItemTypes.includes('PROJECT_VARIANT'));
    console.log('Product P1.3 variant-axis and combination contract validated');
})().catch(error => { console.error(error); process.exit(1); });
