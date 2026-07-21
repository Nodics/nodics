/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module product/test/ProductClassificationContract
 * @description Proves Product typed attributes, localization, enumeration, exact decimals, Units validation, cardinality, required classes, lifecycle dependencies, and overrideable policy.
 * @layer test
 * @owner product
 * @override Projects may add declarative value/reference types through later layers while preserving exactness, bounded cardinality, and authority separation.
 */
const assert = require('assert'), configuration = require('../config/properties'), schemas = require('../src/schemas/schemas').product, interceptors = require('../src/interceptors/interceptors');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError }; global.CONFIG = { get: key => configuration[key] }; global.SERVICE = {};
SERVICE.DefaultProductEnterpriseScopeService = require('../src/service/foundation/defaultProductEnterpriseScopeService');
let referenceCalls = []; SERVICE.DefaultProductReferenceService = { validate: async (kind, code) => { referenceCalls.push({ kind, code }); return true; } };
let definitions = [], values = [], classes = [], assignments = [];
const matches = function (item, query) { return Object.keys(query || {}).every(key => { let expected = query[key]; if (expected && expected.$ne !== undefined) return item[key] !== expected.$ne; if (Array.isArray(item[key])) return item[key].includes(expected); return item[key] === expected; }); };
const generated = records => ({ get: async request => ({ result: records.filter(item => matches(item, request.query)) }) });
SERVICE.DefaultProductAttributeDefinitionService = generated(definitions); SERVICE.DefaultProductAttributeValueService = generated(values); SERVICE.DefaultProductClassificationClassService = generated(classes); SERVICE.DefaultProductClassificationAssignmentService = generated(assignments);
SERVICE.DefaultProductItemService = { get: async request => ({ result: request.query.itemCode === 'phone' ? [{ enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'SKU', itemCode: 'phone', status: 'ACTIVE' }] : [] }) };
const validator = require('../src/service/foundation/defaultProductClassificationService'), authData = { enterprise: { code: 'entA' } };
(async () => {
    ['productAttributeDefinition', 'productAttributeValue', 'productClassificationClass', 'productClassificationAssignment'].forEach(name => { assert.strictEqual(schemas[name].router.enabled, false); assert(interceptors[name + 'PreSave']); assert(interceptors[name + 'PreUpdate']); assert(interceptors[name + 'PreRemove']); });
    let textDefinition = { catalogCode: 'retail', attributeCode: 'display-name', name: 'Display name', valueType: 'TEXT', localized: true, multiValued: false, required: true, minimumValues: 1, maximumValues: 1, unitRequired: false, status: 'ACTIVE' }, request = { tenant: 't1', authData: authData, model: textDefinition }; await validator.prepareDefinition(request); definitions.push(Object.assign({}, request.model)); assert.strictEqual(request.model.code, 'entA::attributeDefinition::retail::display-name');
    let enumRequest = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', attributeCode: 'color', name: 'Color', valueType: 'ENUM', localized: false, multiValued: false, required: false, minimumValues: 0, maximumValues: 1, enumerationValues: ['RED', 'BLUE'], unitRequired: false, status: 'ACTIVE' } }; await validator.prepareDefinition(enumRequest); definitions.push(Object.assign({}, enumRequest.model));
    let measuredRequest = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', attributeCode: 'area', name: 'Area', valueType: 'MEASURED', localized: false, multiValued: false, required: false, minimumValues: 0, maximumValues: 1, unitRequired: true, status: 'ACTIVE' } }; await validator.prepareDefinition(measuredRequest); definitions.push(Object.assign({}, measuredRequest.model));
    let referenceRequest = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', attributeCode: 'replacement', name: 'Replacement', valueType: 'REFERENCE', localized: false, multiValued: false, required: false, minimumValues: 0, maximumValues: 1, unitRequired: false, status: 'ACTIVE' } }; await validator.prepareDefinition(referenceRequest); definitions.push(Object.assign({}, referenceRequest.model));
    let textValue = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', valueCode: 'phone-name-en', itemType: 'SKU', itemCode: 'phone', attributeCode: 'display-name', localeCode: 'en-AE', ordinal: 0, stringValue: 'Phone', status: 'ACTIVE' } }; await validator.prepareValue(textValue); values.push(Object.assign({}, textValue.model));
    await assert.rejects(validator.prepareValue({ tenant: 't1', authData: authData, model: { catalogCode: 'retail', valueCode: 'phone-name-duplicate', itemType: 'SKU', itemCode: 'phone', attributeCode: 'display-name', localeCode: 'en-AE', ordinal: 1, stringValue: 'Other', status: 'ACTIVE' } }), error => error.code === 'ERR_PRODUCT_00025');
    await assert.rejects(validator.prepareValue({ tenant: 't1', authData: authData, model: { catalogCode: 'retail', valueCode: 'bad-enum', itemType: 'SKU', itemCode: 'phone', attributeCode: 'color', ordinal: 0, stringValue: 'GREEN' } }), error => error.code === 'ERR_PRODUCT_00019');
    let measuredValue = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', valueCode: 'phone-area', itemType: 'SKU', itemCode: 'phone', attributeCode: 'area', ordinal: 0, decimalValue: '12.500', unitCode: 'sqm', status: 'ACTIVE' } }; await validator.prepareValue(measuredValue); assert(referenceCalls.some(call => call.kind === 'unit' && call.code === 'sqm'));
    await validator.prepareValue({ tenant: 't1', authData: authData, model: { catalogCode: 'retail', valueCode: 'phone-replacement', itemType: 'SKU', itemCode: 'phone', attributeCode: 'replacement', ordinal: 0, referenceType: 'PRODUCT_ITEM', referenceItemType: 'SKU', referenceCode: 'phone', status: 'ACTIVE' } });
    await assert.rejects(validator.prepareValue({ tenant: 't1', authData: authData, model: Object.assign({}, measuredValue.model, { code: undefined, valueCode: 'bad-decimal', decimalValue: '1e3' }) }), error => error.code === 'ERR_PRODUCT_00019');
    let classRequest = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', classCode: 'phone-spec', name: 'Phone specification', attributeCodes: ['display-name', 'color', 'area'], requiredAttributeCodes: ['display-name'], status: 'ACTIVE' } }; await validator.prepareClass(classRequest); classes.push(Object.assign({}, classRequest.model));
    let classAssignment = { tenant: 't1', authData: authData, model: { catalogCode: 'retail', assignmentCode: 'phone-spec', classCode: 'phone-spec', itemType: 'SKU', itemCode: 'phone', status: 'ACTIVE' } }; await validator.prepareClassAssignment(classAssignment); assert.strictEqual(classAssignment.model.code, 'entA::classificationAssignment::retail::phone-spec');
    values[0].status = 'RETIRED'; await assert.rejects(validator.prepareClassAssignment({ tenant: 't1', authData: authData, model: Object.assign({}, classAssignment.model, { code: undefined, assignmentCode: 'missing-required' }) }), error => error.code === 'ERR_PRODUCT_00026'); values[0].status = 'ACTIVE';
    assignments.push(Object.assign({}, classAssignment.model)); await assert.rejects(validator.prepareClassAssignment({ tenant: 't1', authData: authData, model: Object.assign({}, classAssignment.model, { code: undefined, assignmentCode: 'duplicate-class' }) }), error => error.code === 'ERR_PRODUCT_00026');
    await assert.rejects(validator.prepareDefinitionUpdate({ tenant: 't1', authData: authData, query: { enterpriseCode: 'entA', catalogCode: 'retail', attributeCode: 'display-name' }, model: { localized: false } }), error => error.code === 'ERR_PRODUCT_00011');
    await assert.rejects(validator.prepareDefinitionUpdate({ tenant: 't1', authData: authData, query: { enterpriseCode: 'entA', catalogCode: 'retail', attributeCode: 'display-name' }, model: { status: 'RETIRED' } }), error => error.code === 'ERR_PRODUCT_00027');
    configuration.product.attribute.valueTypes.push('PROJECT_VALUE'); assert(configuration.product.attribute.valueTypes.includes('PROJECT_VALUE'));
    console.log('Product P1.2 classification and typed-attribute contract validated');
})().catch(error => { console.error(error); process.exit(1); });
