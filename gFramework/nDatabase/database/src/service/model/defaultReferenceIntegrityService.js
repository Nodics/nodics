/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/service/model/DefaultReferenceIntegrityService
 * @description Enforces schema-owned inbound reference policies before a
 * generated remove operation. It derives policies from effective `refSchema`
 * contracts and does not maintain a parallel relationship registry.
 * @layer service
 * @owner nDatabase
 * @override Deployments may replace this service with a distributed reference
 * index implementation while preserving the fail-closed remove contract.
 */
module.exports = {
    /**
     * Returns a bounded, non-mutating preview of inbound RESTRICT references.
     * @param {Object} request Generated-style target request.
     * @returns {Promise<Object>} Safe impact summary.
     */
    inspectRemove: async function (request) {
        let config = CONFIG.get('referenceIntegrity');
        if (!config || !Number.isSafeInteger(config.maximumRelationships) ||
            !Number.isSafeInteger(config.maximumTargetRecords)) {
            throw new CLASSES.NodicsError('ERR_DEL_00008',
                'Reference integrity configuration is incomplete');
        }
        let relationships = this.findInboundRelationships(request.schemaModel);
        if (relationships.length > config.maximumRelationships) {
            throw new CLASSES.NodicsError('ERR_DEL_00008',
                'Reference integrity relationship limit exceeded');
        }
        let properties = Array.from(new Set(relationships.map(item => {
            return item.reference.propertyName || 'code';
        })));
        let targetResult = await request.schemaModel.getItems({
            query: request.query,
            options: {
                pageSize: config.maximumTargetRecords + 1,
                pageNumber: 0,
                recursive: false
            },
            searchOptions: {},
            tenant: request.tenant,
            authData: request.authData
        });
        let targets = targetResult && Array.isArray(targetResult.result) ?
            targetResult.result : [];
        if (targets.length > config.maximumTargetRecords) {
            throw new CLASSES.NodicsError('ERR_DEL_00008',
                'Reference integrity target limit exceeded');
        }
        let impacts = [];
        for (let relationship of relationships) {
            let propertyName = relationship.reference.propertyName || 'code';
            let values = targets.map(target => target[propertyName])
                .filter(value => value !== undefined && value !== null);
            let count = values.length > 0 ?
                await this.countReferences(request, relationship, values) : 0;
            impacts.push({
                sourceModule: relationship.sourceModule,
                sourceSchema: relationship.sourceSchema,
                field: relationship.field,
                policy: 'RESTRICT',
                referenceCount: count
            });
        }
        return {
            targetCount: targets.length,
            blocked: impacts.some(item => item.referenceCount > 0),
            relationships: impacts
        };
    },

    /**
     * Enforces all explicit RESTRICT relationships that target the records.
     * @param {Object} request Generated remove request.
     * @returns {Promise<boolean>} True when removal is safe.
     */
    enforceRemove: async function (request) {
        let config = CONFIG.get('referenceIntegrity');
        if (!config || !Number.isSafeInteger(config.maximumRelationships) ||
            !Number.isSafeInteger(config.maximumTargetRecords)) {
            throw new CLASSES.NodicsError('ERR_DEL_00008',
                'Reference integrity configuration is incomplete');
        }
        if (config.enabled === false) return true;

        let relationships = this.findInboundRelationships(request.schemaModel);
        if (relationships.length === 0) return true;
        if (relationships.length > config.maximumRelationships) {
            throw new CLASSES.NodicsError('ERR_DEL_00008',
                'Reference integrity relationship limit exceeded');
        }

        let properties = Array.from(new Set(relationships.map(item => item.reference.propertyName || 'code')));
        let targetResult = await request.schemaModel.getItems({
            query: request.query,
            options: {
                pageSize: config.maximumTargetRecords + 1,
                pageNumber: 0,
                recursive: false
            },
            searchOptions: {},
            tenant: request.tenant,
            authData: request.authData
        });
        let targets = targetResult && Array.isArray(targetResult.result) ? targetResult.result : [];
        if (targets.length > config.maximumTargetRecords) {
            throw new CLASSES.NodicsError('ERR_DEL_00008',
                'Reference integrity target limit exceeded');
        }

        for (let relationship of relationships) {
            let propertyName = relationship.reference.propertyName || 'code';
            let values = targets.map(target => target[propertyName]).filter(value => value !== undefined && value !== null);
            if (values.length > 0) await this.assertNotReferenced(request, relationship, values);
        }
        return true;
    },

    /**
     * Finds effective schema contracts that explicitly restrict target removal.
     * @param {Object} targetSchemaModel Generated target model.
     * @returns {Object[]} Inbound relationship descriptors.
     */
    findInboundRelationships: function (targetSchemaModel) {
        let result = [];
        let targetModule = targetSchemaModel.moduleName;
        let targetSchema = targetSchemaModel.schemaName;
        Object.keys(NODICS.getModules() || {}).forEach(moduleName => {
            let moduleObject = NODICS.getModule(moduleName);
            Object.keys(moduleObject && moduleObject.rawSchema || {}).forEach(schemaName => {
                let schema = moduleObject.rawSchema[schemaName];
                Object.keys(schema && schema.refSchema || {}).forEach(field => {
                    let reference = schema.refSchema[field];
                    let referenceModule = reference.moduleName || moduleName;
                    if (reference && reference.enabled !== false &&
                        String(reference.onTargetDelete || '').toUpperCase() === 'RESTRICT' &&
                        referenceModule === targetModule && reference.schemaName === targetSchema) {
                        result.push({
                            sourceModule: moduleName,
                            sourceSchema: schemaName,
                            field: field,
                            reference: reference
                        });
                    }
                });
            });
        });
        return result;
    },

    /**
     * Rejects deletion if one source record contains a target reference.
     * @param {Object} request Remove request.
     * @param {Object} relationship Source relationship descriptor.
     * @param {Array<*>} values Target reference values.
     * @returns {Promise<boolean>} True when no reference exists.
     */
    assertNotReferenced: async function (request, relationship, values) {
        let count = await this.countReferences(request, relationship, values);
        if (count > 0) {
            throw new CLASSES.NodicsError('ERR_DEL_00007',
                'Remove the reference from ' + relationship.sourceSchema +
                '.' + relationship.field + ' before deleting this record');
        }
        return true;
    },

    /**
     * Counts bounded source records referencing target values.
     * @param {Object} request Generated remove or preview request.
     * @param {Object} relationship Inbound relationship.
     * @param {Array<*>} values Target reference values.
     * @returns {Promise<number>} Reference count.
     */
    countReferences: async function (request, relationship, values) {
        let moduleObject = NODICS.getModule(relationship.sourceModule);
        let modelName = UTILS.createModelName(relationship.sourceSchema);
        let tenantModels = moduleObject && moduleObject.models && moduleObject.models[request.tenant];
        let sourceModel = tenantModels && tenantModels.master && tenantModels.master[modelName];
        if (!sourceModel || typeof sourceModel.getItems !== 'function') {
            let config = CONFIG.get('referenceIntegrity') || {};
            if (config.failClosed !== false) {
                throw new CLASSES.NodicsError('ERR_DEL_00008',
                    'Reference source is unavailable: ' +
                    relationship.sourceModule + '.' + relationship.sourceSchema);
            }
            return 0;
        }

        let result = await sourceModel.getItems({
            query: {
                [relationship.field]: {
                    $in: values
                }
            },
            options: {
                pageSize: 1,
                pageNumber: 0,
                recursive: false
            },
            searchOptions: {},
            tenant: request.tenant,
            authData: request.authData
        });
        let matches = result && Array.isArray(result.result) ? result.result : [];
        return Number(result && result.count || matches.length || 0);
    }
};
