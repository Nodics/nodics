/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/service/schema/DefaultSchemaWorkbenchService
 * @description Projects effective Nodics schemas into a client-safe,
 * searchable model contract for schema-driven BackOffice experiences.
 * It never creates another schema registry and never executes data mutations.
 * @layer service
 * @owner nDatabase
 * @override Projects may enrich or explicitly exclude schemas through
 * `backoffice` metadata while preserving module ownership, access checks,
 * safe default read/search behavior, and secret-field exclusion.
 */
module.exports = {
    /**
     * Lists eligible model schemas visible to the caller.
     * @param {Object} request Authenticated Nodics request.
     * @returns {Promise<Object>} Client-safe descriptor collection.
     */
    list: function (request) {
        let moduleObject = this.getModule(request.moduleName);
        let schemas = Object.keys(moduleObject.rawSchema || {}).map(schemaName => {
            return this.buildDescriptor(request, moduleObject, schemaName);
        }).filter(Boolean);
        return Promise.resolve({
            code: 'SUC_DBS_00000',
            data: {
                moduleName: request.moduleName,
                schemas: schemas
            }
        });
    },

    /**
     * Returns one eligible model schema visible to the caller.
     * @param {Object} request Authenticated request with a schema route parameter.
     * @returns {Promise<Object>} Client-safe schema descriptor.
     */
    get: function (request) {
        let moduleObject = this.getModule(request.moduleName);
        let schemaName = request.httpRequest && request.httpRequest.params ?
            request.httpRequest.params.schema : undefined;
        let descriptor = this.buildDescriptor(request, moduleObject, schemaName);
        if (!descriptor) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004',
                'Schema is not available to Schema Workbench'));
        }
        return Promise.resolve({
            code: 'SUC_DBS_00000',
            data: descriptor
        });
    },

    /**
     * Executes a bounded text search through the owning generated read service.
     * Raw database operators are never accepted from the browser.
     * @param {Object} request Authenticated request.
     * @returns {Promise<Object>} Paged client-safe record response.
     */
    search: function (request) {
        let moduleObject = this.getModule(request.moduleName);
        let schemaName = request.httpRequest && request.httpRequest.params ?
            request.httpRequest.params.schema : undefined;
        let descriptor = this.buildDescriptor(request, moduleObject, schemaName);
        if (!descriptor || !descriptor.operations.includes('search')) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004',
                'Schema search is not available to Schema Workbench'));
        }
        let input = this.buildSearchInput(
            request.httpRequest && request.httpRequest.body || {}, descriptor);
        let serviceName = 'Default' + schemaName.charAt(0).toUpperCase() +
            schemaName.slice(1) + 'Service';
        if (!SERVICE[serviceName] || typeof SERVICE[serviceName].get !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004',
                'Generated schema read service is not available'));
        }
        return SERVICE[serviceName].get({
            tenant: request.tenant,
            authData: request.authData,
            query: input.query,
            searchOptions: input.searchOptions,
            options: { recursive: false }
        }).then(result => {
            return {
                code: 'SUC_DBS_00000',
                data: {
                    records: result.result || [],
                    totalCount: result.count || 0,
                    pageNumber: input.pageNumber,
                    pageSize: input.pageSize,
                    sort: input.sort
                }
            };
        });
    },

    /**
     * Resolves the active owning module and its effective schemas.
     * @param {string} moduleName Owning module name.
     * @returns {Object} Active module object.
     */
    getModule: function (moduleName) {
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject || !moduleObject.rawSchema) {
            throw new CLASSES.NodicsError('ERR_DBS_00004', 'Module schemas are not available');
        }
        return moduleObject;
    },

    /**
     * Builds a descriptor when the schema is an eligible model and the caller
     * can read it. Explicit metadata may disable discovery or add governed
     * mutation operations.
     * @param {Object} request Authenticated Nodics request.
     * @param {Object} moduleObject Active owning module.
     * @param {string} schemaName Schema name.
     * @returns {Object|undefined} Safe descriptor or undefined.
     */
    buildDescriptor: function (request, moduleObject, schemaName) {
        let schema = moduleObject.rawSchema[schemaName];
        let workbenchConfig = CONFIG.get('schemaWorkbench') || {};
        let explicitConfig = schema && schema.backoffice;
        let discoverByDefault = workbenchConfig.discoverModelsByDefault !== false;
        if (!schema || schema.model !== true ||
            (explicitConfig && explicitConfig.enabled === false) ||
            (!discoverByDefault && (!explicitConfig || explicitConfig.enabled !== true))) {
            return undefined;
        }
        if (!Array.isArray(workbenchConfig.defaultModelOperations) ||
            !workbenchConfig.defaultMutationMode) {
            throw new CLASSES.NodicsError('ERR_DBS_00003',
                'Schema Workbench configuration is incomplete');
        }
        let config = Object.assign({
            operations: workbenchConfig.defaultModelOperations,
            mutationMode: workbenchConfig.defaultMutationMode,
            defaultRelationshipActions: workbenchConfig.defaultRelationshipActions
        }, explicitConfig || {});
        let operations = this.getAllowedOperations(request, schema, config);
        if (operations.length === 0) {
            return undefined;
        }
        let displayProperty = config.displayProperty || (schema.definition.code ? 'code' : '_id');
        let displayProperties = Array.isArray(config.displayProperties) && config.displayProperties.length > 0 ?
            config.displayProperties.slice() : this.getDefaultDisplayProperties(schema, displayProperty);
        return {
            moduleName: request.moduleName,
            schemaName: schemaName,
            label: config.label || this.humanize(schemaName),
            description: config.description || '',
            displayProperty: displayProperty,
            displayProperties: displayProperties,
            queryCapabilities: this.buildQueryCapabilities(schema, config, displayProperty),
            bulkCapabilities: this.buildBulkCapabilities(config),
            concurrency: this.buildConcurrency(schema, config),
            aggregateOperations: this.buildAggregateOperations(config),
            mutationMode: config.mutationMode,
            operations: operations,
            fields: this.buildFields(schema, config),
            relationships: this.buildRelationships(request.moduleName, schema, config)
        };
    },

    /**
     * Previews schema-owned inbound reference impact without mutating data.
     * @param {Object} request Authenticated Workbench request.
     * @returns {Promise<Object>} Safe delete-impact response.
     */
    previewDeleteImpact: function (request) {
        let moduleObject = this.getModule(request.moduleName);
        let schemaName = request.httpRequest && request.httpRequest.params ?
            request.httpRequest.params.schema : undefined;
        let descriptor = this.buildDescriptor(request, moduleObject, schemaName);
        if (!descriptor || !descriptor.operations.includes('delete')) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004',
                'Schema delete impact is not available'));
        }
        let body = request.httpRequest && request.httpRequest.body || {};
        let identity = this.buildIdentityQuery(body.identity, descriptor);
        let modelName = UTILS.createModelName(schemaName);
        let models = NODICS.getModels(request.moduleName, request.tenant);
        let schemaModel = models && models[modelName];
        if (!schemaModel) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004',
                'Schema model is not available'));
        }
        return SERVICE.DefaultReferenceIntegrityService.inspectRemove({
            tenant: request.tenant,
            authData: request.authData,
            schemaModel: schemaModel,
            query: identity
        }).then(impact => {
            return { code: 'SUC_DBS_00000', data: impact };
        });
    },

    /**
     * Executes an explicitly enabled, bounded, idempotent bulk delete through
     * the existing generated remove service.
     * @param {Object} request Authenticated Workbench request.
     * @returns {Promise<Object>} Existing generated remove result.
     */
    bulk: function (request) {
        let moduleObject = this.getModule(request.moduleName);
        let schemaName = request.httpRequest && request.httpRequest.params ?
            request.httpRequest.params.schema : undefined;
        let descriptor = this.buildDescriptor(request, moduleObject, schemaName);
        let body = request.httpRequest && request.httpRequest.body || {};
        if (!descriptor || body.operation !== 'DELETE' ||
            !descriptor.bulkCapabilities.operations.includes('DELETE')) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004',
                'Bulk operation is not available'));
        }
        let identities = Array.isArray(body.identities) ? body.identities : [];
        if (identities.length === 0 ||
            identities.length > descriptor.bulkCapabilities.maximumItems) {
            throw new CLASSES.NodicsError('ERR_DBS_00003',
                'Bulk identity count is invalid');
        }
        let idempotencyKey = this.getIdempotencyKey(request);
        if (!idempotencyKey) {
            throw new CLASSES.NodicsError('ERR_DBS_00003',
                'Bulk operation requires an idempotency key');
        }
        let primary = descriptor.fields.find(field => field.primary) ||
            descriptor.fields.find(field => field.name === descriptor.displayProperty) ||
            { name: descriptor.displayProperty };
        if (!primary) {
            throw new CLASSES.NodicsError('ERR_DBS_00003',
                'Bulk identity field is unavailable');
        }
        let values = identities.map(identity => {
            let query = this.buildIdentityQuery(identity, descriptor);
            return query[primary.name];
        });
        let service = this.getGeneratedService(schemaName);
        return service.remove({
            tenant: request.tenant,
            authData: request.authData,
            query: { [primary.name]: { $in: Array.from(new Set(values)) } },
            options: { returnModified: false },
            idempotencyKey: idempotencyKey
        }).then(result => {
            return { code: 'SUC_DBS_00000', data: result };
        });
    },

    /**
     * Delegates an advertised aggregate command to its owning module service.
     * The target service owns transaction, validation, idempotency and outcome.
     * @param {Object} request Authenticated Workbench request.
     * @returns {Promise<Object>} Module-owned aggregate response.
     */
    aggregate: function (request) {
        let moduleObject = this.getModule(request.moduleName);
        let schemaName = request.httpRequest && request.httpRequest.params ?
            request.httpRequest.params.schema : undefined;
        let descriptor = this.buildDescriptor(request, moduleObject, schemaName);
        let body = request.httpRequest && request.httpRequest.body || {};
        let operation = descriptor && descriptor.aggregateOperations
            .find(item => item.name === body.operation);
        let schema = moduleObject.rawSchema[schemaName];
        let configured = schema && schema.backoffice &&
            schema.backoffice.aggregateOperations &&
            schema.backoffice.aggregateOperations[body.operation];
        let config = CONFIG.get('schemaWorkbench') || {};
        let size = Buffer.byteLength(JSON.stringify(body.payload || {}), 'utf8');
        if (!operation || !configured || !configured.service ||
            !configured.operation || size > (config.maximumAggregatePayloadBytes || 50000)) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004',
                'Aggregate operation is not available'));
        }
        let service = SERVICE[configured.service];
        if (!service || typeof service[configured.operation] !== 'function') {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004',
                'Aggregate owner service is unavailable'));
        }
        return Promise.resolve(service[configured.operation]({
            tenant: request.tenant,
            authData: request.authData,
            payload: body.payload || {},
            idempotencyKey: this.getIdempotencyKey(request)
        })).then(result => {
            return { code: 'SUC_DBS_00000', data: result };
        });
    },

    /** Resolves one generated service without inventing a new CRUD path. */
    getGeneratedService: function (schemaName) {
        let serviceName = 'Default' + schemaName.charAt(0).toUpperCase() +
            schemaName.slice(1) + 'Service';
        let service = SERVICE[serviceName];
        if (!service) {
            throw new CLASSES.NodicsError('ERR_DBS_00004',
                'Generated schema service is not available');
        }
        return service;
    },

    /** Returns a bounded request idempotency key. */
    getIdempotencyKey: function (request) {
        let headers = request.headers ||
            request.httpRequest && request.httpRequest.headers || {};
        let value = headers['idempotency-key'] || headers['Idempotency-Key'];
        return typeof value === 'string' && /^[A-Za-z0-9._:-]{8,128}$/.test(value) ?
            value : undefined;
    },

    /** Builds an allowlisted primary-identity query. */
    buildIdentityQuery: function (identity, descriptor) {
        if (!identity || typeof identity !== 'object' || Array.isArray(identity)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003',
                'Workbench identity is invalid');
        }
        let primary = descriptor.fields.find(field => field.primary) ||
            descriptor.fields.find(field => field.name === descriptor.displayProperty) ||
            { name: descriptor.displayProperty };
        let value = identity[primary.name];
        if (!primary.name || !['string', 'number', 'boolean'].includes(typeof value)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003',
                'Workbench identity is invalid');
        }
        let query = { [primary.name]: value };
        if (descriptor.concurrency.mode === 'COMPARE_AND_SET' &&
            descriptor.concurrency.required === true) {
            let expected = identity[descriptor.concurrency.field];
            if (!['string', 'number'].includes(typeof expected)) {
                throw new CLASSES.NodicsError('ERR_DBS_00003',
                    'Workbench concurrency value is required');
            }
            query[descriptor.concurrency.field] = expected;
        }
        return query;
    },

    /**
     * Advertises only schema-explicit bulk operations. Generated CRUD remains
     * the execution authority and the framework does not enable mutation in
     * bulk merely because single-record mutation is available.
     */
    buildBulkCapabilities: function (config) {
        let workbenchConfig = CONFIG.get('schemaWorkbench') || {};
        let requested = Array.isArray(config.bulkOperations) ?
            config.bulkOperations : [];
        return {
            operations: requested.filter(operation => operation === 'DELETE'),
            maximumItems: workbenchConfig.maximumBulkItems || 100,
            idempotencyRequired: true,
            outcomeMode: 'AUTHORITATIVE_RESULT'
        };
    },

    /**
     * Projects an explicit or schema-derived compare-and-set contract.
     * Revision is used only when it is an effective schema field.
     */
    buildConcurrency: function (schema, config) {
        let configured = config.concurrency || {};
        let field = configured.field ||
            (schema.definition && schema.definition.revision ? 'revision' : undefined);
        if (!field || !schema.definition || !schema.definition[field] ||
            configured.enabled === false) {
            return { mode: 'NONE', field: '', required: false };
        }
        return {
            mode: 'COMPARE_AND_SET',
            field: field,
            required: configured.required !== false
        };
    },

    /**
     * Advertises inert aggregate metadata while keeping service and method
     * implementation details private. The owning module remains authority.
     */
    buildAggregateOperations: function (config) {
        let operations = config.aggregateOperations || {};
        return Object.keys(operations).filter(name => {
            let operation = operations[name];
            return operation && operation.enabled !== false &&
                operation.service && operation.operation;
        }).map(name => {
            let operation = operations[name];
            return {
                name: name,
                label: operation.label || this.humanize(name),
                purpose: operation.purpose || 'CUSTOM',
                consistency: operation.consistency || 'MODULE_OWNED',
                confirmationRequired: operation.confirmationRequired === true
            };
        });
    },

    /**
     * Intersects configured operations with schema access points.
     * @param {Object} request Authenticated Nodics request.
     * @param {Object} schema Effective schema.
     * @param {Object} config Schema Workbench configuration.
     * @returns {string[]} Authorized operations.
     */
    getAllowedOperations: function (request, schema, config) {
        let requested = Array.isArray(config.operations) ? config.operations : ['read', 'search'];
        let accessPoint = SERVICE.DefaultSchemaAccessHandlerService.getAccessPoint(
            request.authData, schema.accessGroups);
        let points = CONFIG.get('accessPoints');
        let allowed = [];
        if (accessPoint >= points.readAccessPoint) {
            allowed = requested.filter(operation => ['read', 'search'].includes(operation));
        }
        if (accessPoint >= points.writeAccessPoint) {
            allowed = allowed.concat(requested.filter(operation => ['create', 'update'].includes(operation)));
        }
        if (accessPoint >= points.removeAccessPoint) {
            allowed = allowed.concat(requested.filter(operation => operation === 'delete'));
        }
        return Array.from(new Set(allowed));
    },

    /**
     * Projects effective schema fields without service or secret metadata.
     * @param {Object} schema Effective schema.
     * @param {Object} config Schema Workbench configuration.
     * @returns {Object[]} Client-safe fields.
     */
    buildFields: function (schema, config) {
        let excluded = new Set((config.excludedFields || []).concat([
            'password', 'apiKey', 'apiKeyHash', 'accessGroups'
        ]));
        let managedFields = new Set(['created', 'updated', 'ownerId', 'ownerType', 'createdBy', 'updatedBy']);
        return Object.keys(schema.definition || {}).filter(name => !excluded.has(name)).map(name => {
            let property = schema.definition[name] || {};
            return {
                name: name,
                label: property.label || this.humanize(name),
                type: property.type || (Array.isArray(property.enum) ? 'string' : 'object'),
                required: property.required === true,
                readOnly: property.readOnly === true || managedFields.has(name),
                primary: property.primary === true,
                description: property.description || '',
                enum: Array.isArray(property.enum) ? property.enum.slice() : undefined,
                default: this.isSafeDefault(property.default) ? property.default : undefined,
                searchable: !!(property.searchOptions && property.searchOptions.enabled === true)
            };
        });
    },

    /**
     * Projects schema references into module-aware relationship descriptors.
     * @param {string} moduleName Source module name.
     * @param {Object} schema Effective schema.
     * @param {Object} config Schema Workbench configuration.
     * @returns {Object[]} Relationship descriptors.
     */
    buildRelationships: function (moduleName, schema, config) {
        let relationshipConfig = config.relationships || {};
        return Object.keys(schema.refSchema || {}).filter(name => {
            return schema.refSchema[name] && schema.refSchema[name].enabled !== false;
        }).map(name => {
            let reference = schema.refSchema[name];
            let override = relationshipConfig[name] || {};
            let property = schema.definition[name] || {};
            return {
                field: name,
                label: override.label || property.label || this.humanize(name),
                description: override.description || property.description || '',
                targetModule: override.targetModule || reference.moduleName || moduleName,
                targetSchema: override.targetSchema || reference.schemaName,
                cardinality: reference.type === 'many' ? 'MANY' : 'ONE',
                referenceProperty: reference.propertyName || 'code',
                resolution: override.resolution || 'LOCAL_OR_REMOTE',
                actions: Array.isArray(override.actions) ? override.actions.slice() :
                    (Array.isArray(config.defaultRelationshipActions) ?
                        config.defaultRelationshipActions.slice() :
                        ['SELECT_EXISTING']),
                required: !!(schema.definition[name] && schema.definition[name].required),
                relationshipType: override.relationshipType ||
                    reference.relationshipType || 'ASSOCIATION',
                ownership: override.ownership || reference.ownership || 'SOURCE',
                inverseField: override.inverseField || reference.inverseField || '',
                onTargetDelete: String(reference.onTargetDelete || 'NONE').toUpperCase(),
                maximumDepth: Number.isSafeInteger(override.maximumDepth) ?
                    override.maximumDepth : 3,
                cycleHandling: override.cycleHandling || 'SELECT_EXISTING',
                deleteImpactAvailable:
                    String(reference.onTargetDelete || '').toUpperCase() === 'RESTRICT'
            };
        });
    },

    /**
     * Projects bounded search, sorting, and paging capabilities.
     * @param {Object} schema Effective schema.
     * @param {Object} config Workbench schema configuration.
     * @param {string} displayProperty Stable identity field.
     * @returns {Object} Query capability descriptor.
     */
    buildQueryCapabilities: function (schema, config, displayProperty) {
        let workbenchConfig = CONFIG.get('schemaWorkbench') || {};
        let fields = Object.keys(schema.definition || {});
        let excluded = new Set((config.excludedFields || []).concat([
            'password', 'apiKey', 'apiKeyHash', 'accessGroups'
        ]));
        let searchableFields = fields.filter(name => {
            let property = schema.definition[name] || {};
            return !excluded.has(name) &&
                property.searchOptions && property.searchOptions.enabled === true &&
                ['string', undefined].includes(property.type);
        });
        let sortableFields = fields.filter(name => {
            let property = schema.definition[name] || {};
            return !excluded.has(name) && !['array', 'object'].includes(property.type);
        });
        if (!sortableFields.includes(displayProperty)) {
            sortableFields.unshift(displayProperty);
        }
        let filterFields = fields.filter(name => {
            let property = schema.definition[name] || {};
            return !excluded.has(name) &&
                !['array', 'object'].includes(property.type) &&
                this.getFilterOperators(property).length > 0;
        }).map(name => {
            let property = schema.definition[name] || {};
            return {
                field: name,
                label: property.label || this.humanize(name),
                type: property.type || 'string',
                operators: this.getFilterOperators(property),
                enum: Array.isArray(property.enum) ? property.enum.slice() : undefined
            };
        });
        return {
            searchableFields: searchableFields,
            sortableFields: sortableFields,
            filterFields: filterFields,
            groupOperators: ['AND', 'OR'],
            textOperator: 'CONTAINS',
            allowedPageSizes: (workbenchConfig.allowedPageSizes || [10, 25, 50]).slice(),
            defaultPageSize: workbenchConfig.defaultPageSize || 25,
            maximumPageSize: workbenchConfig.maximumPageSize || 50,
            defaultSort: {
                field: config.defaultSortField || displayProperty,
                direction: config.defaultSortDirection || 'ASC'
            }
        };
    },

    /**
     * Validates browser query input and constructs internal generated-read
     * query/search options.
     * @param {Object} body Browser-safe query input.
     * @param {Object} descriptor Effective Workbench descriptor.
     * @returns {Object} Generated read input.
     */
    buildSearchInput: function (body, descriptor) {
        let workbenchConfig = CONFIG.get('schemaWorkbench') || {};
        let capabilities = descriptor.queryCapabilities;
        let search = typeof body.search === 'string' ? body.search.trim() : '';
        let maximumSearchLength = workbenchConfig.maximumSearchLength || 100;
        if (search.length > maximumSearchLength) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Workbench search text is too long');
        }
        let pageSize = Number(body.pageSize || capabilities.defaultPageSize);
        let pageNumber = Number(body.pageNumber || 1);
        if (!Number.isInteger(pageNumber) || pageNumber < 1 ||
            !Number.isInteger(pageSize) || pageSize < 1 ||
            pageSize > capabilities.maximumPageSize ||
            !capabilities.allowedPageSizes.includes(pageSize)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Workbench paging input is invalid');
        }
        let sort = body.sort || capabilities.defaultSort;
        if (!sort || !capabilities.sortableFields.includes(sort.field) ||
            !['ASC', 'DESC'].includes(sort.direction)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Workbench sorting input is invalid');
        }
        let query = {};
        if (search && capabilities.searchableFields.length > 0) {
            let escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = capabilities.searchableFields.map(field => {
                return { [field]: { $regex: escaped, $options: 'i' } };
            });
        }
        let filterQuery = this.buildFilterQuery(body.filters, capabilities);
        if (filterQuery) {
            query = Object.keys(query).length > 0 ?
                { $and: [query, filterQuery] } : filterQuery;
        }
        return {
            query: query,
            pageNumber: pageNumber,
            pageSize: pageSize,
            sort: { field: sort.field, direction: sort.direction },
            searchOptions: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                sort: { [sort.field]: sort.direction === 'ASC' ? 1 : -1 }
            }
        };
    },

    /**
     * Returns the browser-safe operators supported by one scalar property.
     * @param {Object} property Effective schema property.
     * @returns {string[]} Stable operator names.
     */
    getFilterOperators: function (property) {
        if (Array.isArray(property.enum)) {
            return ['EQUALS', 'NOT_EQUALS', 'IN'];
        }
        switch (property.type || 'string') {
            case 'string':
                return ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'STARTS_WITH'];
            case 'number':
            case 'int':
            case 'integer':
                return ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'GREATER_OR_EQUAL',
                    'LESS_THAN', 'LESS_OR_EQUAL'];
            case 'boolean':
            case 'bool':
                return ['EQUALS', 'NOT_EQUALS'];
            case 'date':
                return ['EQUALS', 'BEFORE', 'AFTER', 'BETWEEN'];
            default:
                return [];
        }
    },

    /**
     * Converts the bounded browser filter tree into an internal database query.
     * @param {Object|undefined} filters Browser filter group.
     * @param {Object} capabilities Effective query capabilities.
     * @returns {Object|undefined} Internal query.
     */
    buildFilterQuery: function (filters, capabilities) {
        if (filters === undefined || filters === null) {
            return undefined;
        }
        let config = CONFIG.get('schemaWorkbench') || {};
        let state = {
            count: 0,
            maximumCount: config.maximumFilterConditions || 20,
            maximumDepth: config.maximumFilterDepth || 3
        };
        return this.buildFilterGroup(filters, capabilities, state, 1);
    },

    /**
     * Recursively validates one AND/OR group.
     * @param {Object} group Browser filter group.
     * @param {Object} capabilities Effective query capabilities.
     * @param {Object} state Shared validation counters.
     * @param {number} depth Current group depth.
     * @returns {Object} Internal grouped query.
     */
    buildFilterGroup: function (group, capabilities, state, depth) {
        if (!group || typeof group !== 'object' || Array.isArray(group) ||
            !capabilities.groupOperators.includes(group.operator) ||
            !Array.isArray(group.items) || group.items.length === 0 ||
            depth > state.maximumDepth) {
            throw new CLASSES.NodicsError('ERR_DBS_00003',
                'Workbench filter group is invalid');
        }
        let items = group.items.map(item => {
            if (item && Array.isArray(item.items)) {
                return this.buildFilterGroup(item, capabilities, state, depth + 1);
            }
            state.count += 1;
            if (state.count > state.maximumCount) {
                throw new CLASSES.NodicsError('ERR_DBS_00003',
                    'Workbench filter condition limit exceeded');
            }
            return this.buildFilterCondition(item, capabilities);
        });
        return { [group.operator === 'AND' ? '$and' : '$or']: items };
    },

    /**
     * Validates one typed condition and maps it to an internal query fragment.
     * @param {Object} condition Browser condition.
     * @param {Object} capabilities Effective query capabilities.
     * @returns {Object} Internal condition query.
     */
    buildFilterCondition: function (condition, capabilities) {
        if (!condition || typeof condition !== 'object' || Array.isArray(condition)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003',
                'Workbench filter condition is invalid');
        }
        let field = capabilities.filterFields.find(item => item.field === condition.field);
        if (!field || !field.operators.includes(condition.operator)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003',
                'Workbench filter field or operator is invalid');
        }
        let value = this.normalizeFilterValue(condition.value, field);
        switch (condition.operator) {
            case 'EQUALS': return { [field.field]: value };
            case 'NOT_EQUALS': return { [field.field]: { $ne: value } };
            case 'GREATER_THAN': return { [field.field]: { $gt: value } };
            case 'GREATER_OR_EQUAL': return { [field.field]: { $gte: value } };
            case 'LESS_THAN': return { [field.field]: { $lt: value } };
            case 'LESS_OR_EQUAL': return { [field.field]: { $lte: value } };
            case 'BEFORE': return { [field.field]: { $lt: value } };
            case 'AFTER': return { [field.field]: { $gt: value } };
            case 'CONTAINS':
                return { [field.field]: {
                    $regex: this.escapeSearchText(value), $options: 'i'
                } };
            case 'STARTS_WITH':
                return { [field.field]: {
                    $regex: '^' + this.escapeSearchText(value), $options: 'i'
                } };
            case 'IN':
                return { [field.field]: { $in: value } };
            case 'BETWEEN':
                if (!Array.isArray(value) || value.length !== 2) {
                    throw new CLASSES.NodicsError('ERR_DBS_00003',
                        'Workbench range filter is invalid');
                }
                return { [field.field]: { $gte: value[0], $lte: value[1] } };
            default:
                throw new CLASSES.NodicsError('ERR_DBS_00003',
                    'Workbench filter operator is unsupported');
        }
    },

    /**
     * Normalizes a filter value according to advertised schema type.
     * @param {*} value Browser value.
     * @param {Object} field Filter field capability.
     * @returns {*} Safe typed value.
     */
    normalizeFilterValue: function (value, field) {
        if (field.operators.includes('IN') && Array.isArray(value)) {
            if (value.length === 0 || value.length > 50 ||
                value.some(item => typeof item !== 'string') ||
                (field.enum && value.some(item => !field.enum.includes(item)))) {
                throw new CLASSES.NodicsError('ERR_DBS_00003',
                    'Workbench filter list is invalid');
            }
            return value.slice();
        }
        if (['boolean', 'bool'].includes(field.type)) {
            if (typeof value !== 'boolean') {
                throw new CLASSES.NodicsError('ERR_DBS_00003',
                    'Workbench boolean filter is invalid');
            }
            return value;
        }
        if (['number', 'int', 'integer'].includes(field.type)) {
            if (typeof value !== 'number' || !Number.isFinite(value)) {
                throw new CLASSES.NodicsError('ERR_DBS_00003',
                    'Workbench number filter is invalid');
            }
            return value;
        }
        if (field.type === 'date') {
            let values = Array.isArray(value) ? value : [value];
            if (values.length === 0 || values.length > 2 ||
                values.some(item => typeof item !== 'string' ||
                    !Number.isFinite(Date.parse(item)))) {
                throw new CLASSES.NodicsError('ERR_DBS_00003',
                    'Workbench date filter is invalid');
            }
            let dates = values.map(item => new Date(item));
            return Array.isArray(value) ? dates : dates[0];
        }
        if (typeof value !== 'string' || value.length === 0 || value.length > 200 ||
            (field.enum && !field.enum.includes(value))) {
            throw new CLASSES.NodicsError('ERR_DBS_00003',
                'Workbench text filter is invalid');
        }
        return value;
    },

    /**
     * Escapes a literal value before constructing an internal regular expression.
     * @param {string} value Literal search input.
     * @returns {string} Escaped expression text.
     */
    escapeSearchText: function (value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Selects a bounded, client-safe record identity without requiring every
     * model to repeat the same BackOffice metadata. Explicit
     * `backoffice.displayProperties` always takes precedence.
     * @param {Object} schema Effective schema.
     * @param {string} displayProperty Stable fallback identity property.
     * @returns {string[]} Ordered record presentation properties.
     */
    getDefaultDisplayProperties: function (schema, displayProperty) {
        let definition = schema.definition || {};
        let excluded = new Set(['password', 'apiKey', 'apiKeyHash', 'accessGroups']);
        let candidates = [displayProperty, 'description'];
        return Array.from(new Set(candidates.filter(name => {
            return name === displayProperty || (!excluded.has(name) && !!definition[name]);
        })));
    },

    /**
     * Checks whether a default can be sent safely as inert JSON metadata.
     * @param {*} value Configured default.
     * @returns {boolean} True for scalar or empty defaults.
     */
    isSafeDefault: function (value) {
        return value === undefined || value === null ||
            ['string', 'number', 'boolean'].includes(typeof value);
    },

    /**
     * Converts a technical identifier into a readable fallback label.
     * @param {string} value Technical identifier.
     * @returns {string} Human-readable label.
     */
    humanize: function (value) {
        let text = String(value || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/[_-]+/g, ' ').trim();
        return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
    }
};
