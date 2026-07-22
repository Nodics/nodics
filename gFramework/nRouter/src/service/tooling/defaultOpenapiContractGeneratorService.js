/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * @module nRouter/service/tooling/defaultOpenapiContractGeneratorService
 * @description Generates an OpenAPI contract from the effective layered router and schema definitions for a selected Nodics server or node.
 * @layer tooling
 * @owner nRouter
 * @override Projects may explicitly replace the `docs:openapi` tooling command or extend effective router/schema definitions through normal module hierarchy.
 */

const rootDir = path.resolve(process.env.NODICS_HOME || process.cwd());
const frameworkRootDir = path.resolve(__dirname, '../../../..');
const runtimeRootDir = fs.existsSync(path.join(rootDir, 'gFramework', 'nConfig')) ? rootDir : frameworkRootDir;
const config = require(path.join(runtimeRootDir, 'gFramework', 'nConfig'));
const env = require(path.join(runtimeRootDir, 'env'));

function readOption(args, name, defaultValue) {
    const prefix = name + '=';
    const match = args.find(arg => arg.indexOf(prefix) === 0);
    if (!match) {
        return defaultValue;
    }
    return match.slice(prefix.length);
}

function readBooleanOption(args, name, defaultValue) {
    if (args.includes(name)) {
        return true;
    }
    if (args.includes(name.replace('--', '--no-'))) {
        return false;
    }
    return defaultValue;
}

function ensureRuntimeArgument(prefix, value) {
    if (!value) {
        return;
    }
    const hasArg = process.argv.some(arg => arg.indexOf(prefix + '=') === 0);
    if (!hasArg) {
        process.argv.push(prefix + '=' + value);
    }
}

function clone(value) {
    return _.merge({}, value || {});
}

function upperCaseEachWord(value) {
    return String(value || '').split(/[-_\s]+/).filter(Boolean).map(part => {
        return part.charAt(0).toUpperCase() + part.slice(1);
    }).join('');
}

function replaceAll(value, search, replacement) {
    return String(value || '').split(search).join(replacement);
}

function toOpenApiPath(url) {
    return String(url || '').replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function getPathParameters(openApiPath) {
    const parameters = [];
    const pattern = /\{([^}]+)\}/g;
    let match;
    while ((match = pattern.exec(openApiPath)) !== null) {
        parameters.push({
            name: match[1],
            in: 'path',
            required: true,
            schema: {
                type: 'string'
            }
        });
    }
    return parameters;
}

function getSecurityParameters(route) {
    if (!route.secured) {
        return [];
    }
    return [
        {
            name: 'x-enterprise-code',
            in: 'header',
            required: false,
            description: 'Enterprise code used for tenant resolution where API-key or login based flows require it. Legacy entCode header is deprecated.',
            schema: {
                type: 'string'
            }
        }
    ];
}

function getDeclaredParameters(route) {
    const declared = route.parameters || (route.help && route.help.parameters) || [];
    if (Array.isArray(declared)) return declared.map(parameter => clone(parameter));
    return Object.keys(declared).map(name => {
        const definition = declared[name];
        if (definition && typeof definition === 'object') {
            return Object.assign({ name: name, in: definition.in || 'query', required: !!definition.required }, definition);
        }
        return { name: name, in: 'query', required: false, description: String(definition), schema: { type: 'string' } };
    });
}

function mergeParameters(parameters) {
    const merged = new Map();
    parameters.forEach(parameter => {
        if (!parameter || !parameter.name || !parameter.in) return;
        if (parameter.in === 'path') parameter.required = true;
        merged.set(parameter.in + ':' + parameter.name, parameter);
    });
    return Array.from(merged.values());
}

function hasBody(method) {
    return ['post', 'put', 'patch', 'delete'].includes(String(method || '').toLowerCase());
}

function toJsonSchemaType(type) {
    const normalized = String(type || 'object').toLowerCase();
    if (['string', 'object', 'array', 'number', 'integer', 'boolean'].includes(normalized)) {
        return normalized;
    }
    if (['int', 'long'].includes(normalized)) {
        return 'integer';
    }
    if (['bool'].includes(normalized)) {
        return 'boolean';
    }
    if (['date', 'datetime', 'objectid'].includes(normalized)) {
        return 'string';
    }
    return 'object';
}

function toJsonSchemaFormat(type) {
    const normalized = String(type || '').toLowerCase();
    if (normalized === 'date' || normalized === 'datetime') {
        return 'date-time';
    }
    return undefined;
}

function createSchemaProperty(propertyDefinition, referenceDefinition) {
    const property = {};
    if (propertyDefinition.enum && Array.isArray(propertyDefinition.enum)) {
        property.type = toJsonSchemaType(propertyDefinition.type || typeof propertyDefinition.enum[0]);
        property.enum = propertyDefinition.enum;
    } else {
        property.type = toJsonSchemaType(propertyDefinition.type);
    }
    const format = toJsonSchemaFormat(propertyDefinition.type);
    if (format) {
        property.format = format;
    }
    if (property.type === 'array') {
        property.items = propertyDefinition.items ? createSchemaProperty(propertyDefinition.items) : {};
    }
    if (property.type === 'object' && propertyDefinition.properties) {
        property.properties = {};
        Object.keys(propertyDefinition.properties).forEach(name => {
            property.properties[name] = createSchemaProperty(propertyDefinition.properties[name]);
        });
    }
    if (propertyDefinition.description) {
        property.description = propertyDefinition.description;
    }
    if (propertyDefinition.default !== undefined && typeof propertyDefinition.default !== 'function') {
        property.default = propertyDefinition.default;
    }
    ['example', 'minimum', 'maximum', 'minLength', 'maxLength', 'pattern', 'readOnly', 'writeOnly', 'nullable'].forEach(name => {
        if (propertyDefinition[name] !== undefined) {
            property[name] = propertyDefinition[name];
        }
    });
    if (referenceDefinition && referenceDefinition.enabled) {
        property['x-nodics-reference'] = clone(referenceDefinition);
    }
    return property;
}

function inferExampleSchema(value) {
    if (Array.isArray(value)) {
        return {
            type: 'array',
            items: value.length > 0 ? inferExampleSchema(value[0]) : {}
        };
    }
    if (value && typeof value === 'object') {
        const properties = {};
        Object.keys(value).forEach(name => {
            properties[name] = inferExampleSchema(value[name]);
        });
        return { type: 'object', properties: properties };
    }
    if (typeof value === 'boolean') return { type: 'boolean', example: value };
    if (typeof value === 'number') return { type: Number.isInteger(value) ? 'integer' : 'number', example: value };
    return { type: 'string', description: typeof value === 'string' ? value : undefined };
}

function createCrudRequestSchema(route) {
    const componentName = route['x-nodics'] && route['x-nodics'].schemaComponentName;
    if (!componentName) return undefined;
    const model = { '$ref': '#/components/schemas/' + componentName };
    if (route.operation === 'saveAll') return { type: 'array', items: model };
    if (route.operation === 'update') return { oneOf: [model, { type: 'array', items: model }] };
    if (route.operation === 'save') return model;
    return undefined;
}

function createSchemaComponent(moduleName, schemaName, schemaObject) {
    const required = [];
    const properties = {};
    Object.keys(schemaObject.definition || {}).forEach(propertyName => {
        const propertyDefinition = schemaObject.definition[propertyName] || {};
        properties[propertyName] = createSchemaProperty(propertyDefinition, schemaObject.refSchema && schemaObject.refSchema[propertyName]);
        if (propertyDefinition.required) {
            required.push(propertyName);
        }
    });
    const schema = {
        type: 'object',
        description: schemaObject.description || 'Nodics schema `' + schemaName + '` owned by module `' + moduleName + '`.',
        properties: properties,
        'x-nodics': {
            moduleName: moduleName,
            schemaName: schemaName,
            model: !!schemaObject.model,
            routerEnabled: !!(schemaObject.router && schemaObject.router.enabled),
            serviceEnabled: !!(schemaObject.service && schemaObject.service.enabled),
            tenants: schemaObject.tenants || []
        }
    };
    if (required.length > 0) {
        schema.required = required;
    }
    return schema;
}

function createRequestBody(route) {
    if (!hasBody(route.method)) {
        return undefined;
    }
    if (route.requestBody) return clone(route.requestBody);
    const helpBody = route.help && route.help.body;
    const schema = createCrudRequestSchema(route) || (helpBody ? inferExampleSchema(helpBody) : undefined);
    if (!schema) return undefined;
    return {
        required: false,
        content: {
            'application/json': {
                schema: schema
            }
        }
    };
}

function createResponses(route) {
    if (route.responses) return clone(route.responses);
    if (route.responseHandler === 'fileDownloadResponseHandler') {
        return {
            '200': {
                description: 'Downloadable file.',
                content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } }
            },
            default: { '$ref': '#/components/responses/NodicsError' }
        };
    }
    return {
        '200': { '$ref': '#/components/responses/NodicsSuccess' },
        default: { '$ref': '#/components/responses/NodicsError' }
    };
}

function createOperation(route) {
    const openApiPath = toOpenApiPath(route.url);
    const parameters = mergeParameters(getPathParameters(openApiPath).concat(getDeclaredParameters(route), getSecurityParameters(route)));
    const operation = {
        operationId: route.routerName,
        summary: route.summary || (route.operation ? route.operation + ' via ' + (route.controller || route.handler) : route.routerName),
        description: route.description || (route.help && route.help.message ? route.help.message : 'Nodics route generated from the active module hierarchy.'),
        tags: route.tags || [route.moduleName],
        parameters: parameters,
        responses: createResponses(route),
        'x-nodics': route['x-nodics']
    };
    const requestBody = createRequestBody(route);
    if (requestBody) {
        operation.requestBody = requestBody;
    }
    if (route.secured) {
        operation.security = [
            {
                bearerAuth: []
            },
            {
                apiKeyAuth: []
            }
        ];
    }
    return operation;
}

function addRoute(paths, route) {
    if (!route || !route.url || !route.method || route.active === false) {
        return;
    }
    const openApiPath = toOpenApiPath(route.url);
    const method = String(route.method).toLowerCase();
    if (!paths[openApiPath]) {
        paths[openApiPath] = {};
    }
    const incoming = createOperation(route);
    if (paths[openApiPath][method]) {
        const existing = paths[openApiPath][method];
        const existingMetadata = existing['x-nodics'] || {};
        const incomingMetadata = route['x-nodics'] || {};
        const comparable = operation => JSON.stringify({
            summary: operation.summary,
            description: operation.description,
            parameters: operation.parameters,
            requestBody: operation.requestBody,
            responses: operation.responses,
            security: operation.security
        });
        const equivalent = comparable(existing) === comparable(incoming) &&
            JSON.stringify(existingMetadata.accessGroups || []) === JSON.stringify(incomingMetadata.accessGroups || []) &&
            existingMetadata.permission === incomingMetadata.permission &&
            JSON.stringify(existingMetadata.permissions || []) === JSON.stringify(incomingMetadata.permissions || []) &&
            JSON.stringify(existingMetadata.permissionConfig || []) === JSON.stringify(incomingMetadata.permissionConfig || []) &&
            JSON.stringify(existingMetadata.authTokenTypes || []) === JSON.stringify(incomingMetadata.authTokenTypes || []);
        if (equivalent) {
            existingMetadata.duplicateDeclarations = existingMetadata.duplicateDeclarations || [];
            existingMetadata.duplicateDeclarations.push({
                moduleName: incomingMetadata.moduleName,
                routerName: incomingMetadata.routerName,
                source: incomingMetadata.source
            });
            return;
        }
        throw new Error('Duplicate effective route for ' + method.toUpperCase() + ' ' + openApiPath + ': ' +
            existing.operationId + ' and ' + route.routerName);
    }
    paths[openApiPath][method] = incoming;
}

function prepareDefaultRoute(options) {
    const definition = clone(options.routerDef);
    const schemaName = options.schemaName;
    const schemaObject = options.schemaObject;
    definition.method = String(definition.method || '').toLowerCase();
    definition.key = replaceAll(definition.key, 'schemaName', String(options.alias || schemaName).toLowerCase());
    definition.controller = replaceAll(definition.controller, 'ctrlName', upperCaseEachWord(schemaName) + 'Controller');
    definition.apiVersion = definition.apiVersion || 'v0';
    definition.url = '/' + options.contextRoot + '/' + options.urlPrefix + '/' + definition.apiVersion + definition.key;
    definition.active = definition.active === undefined ? true : definition.active;
    definition.moduleName = options.moduleName;
    definition.prefix = schemaName + '_' + options.routerName;
    definition.routerName = (options.moduleName + '_' + schemaName + '_' + options.routerName).toLowerCase();
    definition.cache = _.merge({}, definition.cache || {});
    if (options.routerLevelCache && options.routerLevelCache[definition.method]) {
        definition.cache = _.merge(definition.cache, options.routerLevelCache[definition.method]);
    }
    definition['x-nodics'] = {
        source: 'schema-generated',
        moduleName: options.moduleName,
        schemaOwner: options.schemaOwner,
        schemaName: schemaName,
        schemaComponentName: options.schemaComponentName,
        routerName: options.routerName,
        controller: definition.controller,
        operation: definition.operation,
        accessGroups: definition.accessGroups || [],
        cache: definition.cache,
        active: definition.active,
        permission: definition.permission,
        permissions: definition.permissions || [],
        permissionConfig: definition.permissionConfig || [],
        authTokenTypes: definition.authTokenTypes || [],
        routerAlias: schemaObject.router && schemaObject.router.alias
    };
    return definition;
}

function isValidRoute(routerName, routerDef) {
    if (routerDef && routerDef.accessGroups && routerDef.accessGroups.length > 0) {
        return true;
    }
    throw new CLASSES.NodicsError('Invalid router definition: accessGroups is not valid for: ' + routerName);
}

function prepareConfiguredRoute(options) {
    const definition = clone(options.routerDef);
    definition.method = String(definition.method || '').toLowerCase();
    definition.apiVersion = definition.apiVersion || 'v0';
    definition.url = '/' + options.contextRoot + '/' + options.urlPrefix + '/' + definition.apiVersion + definition.key;
    definition.active = definition.active === undefined ? true : definition.active;
    definition.moduleName = options.moduleName;
    definition.prefix = options.routerName;
    definition.routerName = (options.moduleName + '_' + options.routerName).toLowerCase();
    definition['x-nodics'] = {
        source: options.source,
        moduleName: options.moduleName,
        routerGroup: options.groupName,
        routerName: options.routerName,
        controller: definition.controller,
        handler: definition.handler,
        operation: definition.operation,
        accessGroups: definition.accessGroups || [],
        cache: definition.cache || {},
        active: definition.active,
        permission: definition.permission,
        permissions: definition.permissions || [],
        permissionConfig: definition.permissionConfig || [],
        authTokenTypes: definition.authTokenTypes || [],
        responseHandler: definition.responseHandler,
        publicProbe: definition.publicProbe === true,
        publicAccess: definition.publicAccess === true
    };
    return definition;
}

function addDefaultRoutes(paths, options) {
    Object.keys(options.routers.default || {}).forEach(groupName => {
        if (groupName === 'options') {
            return;
        }
        Object.keys(options.routers.default[groupName] || {}).forEach(routerName => {
            if (routerName === 'options') {
                return;
            }
            isValidRoute(routerName, options.routers.default[groupName][routerName]);
            addRoute(paths, prepareDefaultRoute(Object.assign({}, options, {
                routerDef: options.routers.default[groupName][routerName],
                routerName: routerName
            })));
        });
    });
}

function addConfiguredRoutes(paths, options) {
    Object.keys(options.routeGroup || {}).forEach(groupName => {
        if (groupName === 'options') {
            return;
        }
        Object.keys(options.routeGroup[groupName] || {}).forEach(routerName => {
            if (routerName === 'options') {
                return;
            }
            isValidRoute(routerName, options.routeGroup[groupName][routerName]);
            addRoute(paths, prepareConfiguredRoute(Object.assign({}, options, {
                routerDef: options.routeGroup[groupName][routerName],
                groupName: groupName,
                routerName: routerName
            })));
        });
    });
}

function collectRoutes(rawRouters, rawSchema, components) {
    const paths = {};
    const modules = NODICS.getModules();
    const contextRoot = CONFIG.get('servers').options.contextRoot;
    const routerLevelCacheConfig = CONFIG.get('cache').routerLevelCache || {};

    Object.keys(modules || {}).forEach(moduleName => {
        const moduleObject = modules[moduleName];
        if (!UTILS.isRouterEnabled(moduleName)) {
            return;
        }
        const urlPrefix = moduleObject.metaData.prefix || moduleName;
        Object.keys(moduleObject.rawSchema || {}).forEach(schemaName => {
            const schemaObject = moduleObject.rawSchema[schemaName];
            if (schemaObject.service && schemaObject.service.enabled &&
                schemaObject.router && schemaObject.router.enabled &&
                (!schemaObject.router.target || schemaObject.router.target === moduleName)) {
                addDefaultRoutes(paths, {
                    routers: rawRouters,
                    contextRoot: contextRoot,
                    urlPrefix: urlPrefix,
                    moduleName: moduleName,
                    schemaOwner: moduleName,
                    schemaName: schemaName,
                    schemaObject: schemaObject,
                    alias: schemaObject.router.alias || schemaName,
                    schemaComponentName: moduleName + '_' + schemaName,
                    routerLevelCache: routerLevelCacheConfig[schemaName]
                });
            }
        });
        Object.keys(modules || {}).forEach(sourceModuleName => {
            const sourceModuleObject = modules[sourceModuleName];
            Object.keys(sourceModuleObject.rawSchema || {}).forEach(schemaName => {
                const schemaObject = sourceModuleObject.rawSchema[schemaName];
                if (schemaObject.service && schemaObject.service.enabled &&
                    schemaObject.router && schemaObject.router.enabled &&
                    schemaObject.router.target && schemaObject.router.target === moduleName &&
                    schemaObject.router.target !== sourceModuleName) {
                    addDefaultRoutes(paths, {
                        routers: rawRouters,
                        contextRoot: contextRoot,
                        urlPrefix: urlPrefix,
                        moduleName: moduleName,
                        schemaOwner: sourceModuleName,
                        schemaName: schemaName,
                        schemaObject: schemaObject,
                        alias: schemaObject.router.alias || schemaName,
                        schemaComponentName: sourceModuleName + '_' + schemaName,
                        routerLevelCache: routerLevelCacheConfig[schemaName]
                    });
                }
            });
        });
        addConfiguredRoutes(paths, {
            routeGroup: rawRouters.common,
            contextRoot: contextRoot,
            urlPrefix: urlPrefix,
            moduleName: moduleName,
            source: 'common-router'
        });
        addConfiguredRoutes(paths, {
            routeGroup: rawRouters[moduleName],
            contextRoot: contextRoot,
            urlPrefix: urlPrefix,
            moduleName: moduleName,
            source: 'module-router'
        });
    });
    return paths;
}

function validateDocument(document) {
    const errors = [];
    const operationIds = new Set();
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'];
    if (!document || document.openapi !== '3.0.3') errors.push('openapi must be 3.0.3');
    if (!document.info || !document.info.title || !document.info.version) errors.push('info.title and info.version are required');
    Object.keys(document.paths || {}).forEach(pathName => {
        const declaredPathParameters = new Set((pathName.match(/\{[^}]+\}/g) || []).map(value => value.slice(1, -1)));
        Object.keys(document.paths[pathName] || {}).forEach(method => {
            if (!methods.includes(method)) return;
            const operation = document.paths[pathName][method];
            if (!operation.operationId) errors.push(method.toUpperCase() + ' ' + pathName + ' has no operationId');
            if (operationIds.has(operation.operationId)) errors.push('Duplicate operationId: ' + operation.operationId);
            operationIds.add(operation.operationId);
            if (!operation.responses || Object.keys(operation.responses).length === 0) errors.push(operation.operationId + ' has no responses');
            const parameterKeys = new Set();
            (operation.parameters || []).forEach(parameter => {
                const key = parameter.in + ':' + parameter.name;
                if (parameterKeys.has(key)) errors.push(operation.operationId + ' has duplicate parameter ' + key);
                parameterKeys.add(key);
            });
            const operationPathParameters = new Set((operation.parameters || []).filter(parameter => parameter.in === 'path').map(parameter => parameter.name));
            declaredPathParameters.forEach(name => {
                if (!operationPathParameters.has(name)) errors.push(operation.operationId + ' is missing path parameter ' + name);
            });
        });
    });
    const localReferences = [];
    const collectReferences = value => {
        if (!value || typeof value !== 'object') return;
        if (typeof value.$ref === 'string' && value.$ref.indexOf('#/') === 0) localReferences.push(value.$ref);
        Object.keys(value).forEach(name => collectReferences(value[name]));
    };
    const resolveReference = reference => reference.slice(2).split('/').reduce((value, name) => value && value[name], document);
    collectReferences(document);
    localReferences.forEach(reference => {
        if (!resolveReference(reference)) errors.push('Unresolved local reference: ' + reference);
    });
    if (errors.length > 0) throw new Error('Invalid generated OpenAPI contract:\n- ' + errors.join('\n- '));
    return true;
}

async function loadEffectiveSchemas(options, warnings) {
    SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.loadSchemaFiles('/src/schemas/schemas.js', null));
    if (options.includeRuntimeSchemas && SERVICE.DefaultDatabaseConnectionHandlerService) {
        const defaultTenant = CONFIG.get('defaultTenant') || 'default';
        try {
            await SERVICE.DefaultDatabaseConnectionHandlerService.createDatabaseConnection(defaultTenant, true);
            const runtimeSchema = await SERVICE.DefaultDatabaseConnectionHandlerService.getRuntimeSchema();
            SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.mergeRuntimeSchemaFiles(
                SERVICE.DefaultDatabaseConfigurationService.getRawSchema(),
                runtimeSchema
            ));
            SERVICE.DefaultDatabaseConnectionHandlerService.closeConnection('default', defaultTenant);
        } catch (error) {
            warnings.push('Runtime persisted schemas were not included: ' + error.message);
        }
    }
    await SERVICE.DefaultDatabaseSchemaHandlerService.buildDatabaseSchema(SERVICE.DefaultDatabaseConfigurationService.getRawSchema());
    return SERVICE.DefaultDatabaseConfigurationService.getRawSchema();
}

function collectSchemas(rawSchema) {
    const schemas = {};
    Object.keys(rawSchema || {}).forEach(moduleName => {
        Object.keys(rawSchema[moduleName] || {}).forEach(schemaName => {
            schemas[moduleName + '_' + schemaName] = createSchemaComponent(moduleName, schemaName, rawSchema[moduleName][schemaName]);
        });
    });
    return schemas;
}

async function initialize(options, warnings) {
    await config.prepareBuild(options);
    await config.initUtilities(options);
    await config.loadModules();
    await config.initEntities();
    if (SERVICE.DefaultStatusService && SERVICE.DefaultStatusService.loadStatusDefinitions) {
        SERVICE.DefaultStatusService.loadStatusDefinitions();
    }
    const rawSchema = await loadEffectiveSchemas(options, warnings);
    await SERVICE.DefaultRouterService.prepareModulesConfiguration();
    const rawRouters = SERVICE.DefaultFilesLoaderService.loadRouterFiles('/src/router/routers.js');
    SERVICE.DefaultRouterConfigurationService.setRawRouters(rawRouters);
    return {
        rawRouters: rawRouters,
        rawSchema: rawSchema
    };
}

function createDocument(input) {
    const components = collectSchemas(input.rawSchema);
    const paths = collectRoutes(input.rawRouters, input.rawSchema, components);
    const document = {
        openapi: '3.0.3',
        info: {
            title: 'Nodics API Contract',
            version: '0.1.0',
            description: 'Generated from the active Nodics module hierarchy, effective schemas, and effective router definitions.'
        },
        servers: [
            {
                url: '/',
                description: 'Host root; generated paths already include the effective Nodics context root.'
            }
        ],
        paths: paths,
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                },
                apiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-api-key'
                }
            },
            schemas: Object.assign({
                NodicsSuccessEnvelope: {
                    type: 'object',
                    required: ['code'],
                    properties: {
                        code: { type: 'string' },
                        responseCode: { type: 'integer' },
                        message: { type: 'string' },
                        data: {},
                        metadata: { type: 'object' }
                    }
                },
                NodicsErrorEnvelope: {
                    type: 'object',
                    required: ['code', 'message'],
                    properties: {
                        code: { type: 'string' },
                        responseCode: { type: 'integer' },
                        message: { type: 'string' },
                        traceId: { type: 'string' },
                        contexts: { type: 'array', items: { type: 'object' } },
                        causes: { type: 'array', items: { type: 'object' } },
                        errors: { type: 'array', items: { type: 'object' } }
                    }
                }
            }, components),
            responses: {
                NodicsSuccess: {
                    description: 'Successful Nodics response envelope.',
                    content: { 'application/json': { schema: { '$ref': '#/components/schemas/NodicsSuccessEnvelope' } } }
                },
                NodicsError: {
                    description: 'Nodics error response envelope.',
                    content: { 'application/json': { schema: { '$ref': '#/components/schemas/NodicsErrorEnvelope' } } }
                }
            }
        },
        'x-nodics': {
            generatedAt: new Date().toISOString(),
            serverName: NODICS.getServerName(),
            serverRootName: NODICS.getServerRootName(),
            environmentName: NODICS.getSelectedEnvironmentName ? NODICS.getSelectedEnvironmentName() : NODICS.getEnvironmentName(),
            nodeName: NODICS.getNodeName(),
            activeModules: NODICS.getActiveModules(),
            includeRuntimeSchemas: input.options.includeRuntimeSchemas,
            warnings: input.warnings
        }
    };
    validateDocument(document);
    return document;
}

function createOptions(args) {
    const environmentName = readOption(args, '--environment', null);
    const serverName = readOption(args, '--server', null);
    const nodeName = readOption(args, '--node', null);
    ensureRuntimeArgument('E', environmentName);
    ensureRuntimeArgument('S', serverName);
    ensureRuntimeArgument('NODE', nodeName);
    return {
        defaultEnvironment: environmentName || env.defaultOptions.defaultEnvironment,
        defaultServer: serverName || env.defaultOptions.defaultServer,
        includeRuntimeSchemas: readBooleanOption(args, '--runtime-schemas', false),
        outputDir: readOption(args, '--output-dir', null)
    };
}

function getDefaultOutputDir() {
    const modulePath = NODICS.getServerPath();
    if (!modulePath) {
        throw new CLASSES.NodicsError('Unable to resolve active server path for generated OpenAPI contract output');
    }
    return path.join(modulePath, 'generated', 'openapi');
}

function assertOutputDirAllowed(outputDir) {
    const resolvedOutputDir = path.resolve(outputDir);
    const serverPath = path.resolve(NODICS.getServerPath());
    if (resolvedOutputDir.indexOf(serverPath + path.sep) !== 0) {
        throw new CLASSES.NodicsError('Generated API contracts must be written under the active server module');
    }
}

async function runCli(args) {
    const options = createOptions(args || []);
    const warnings = [];
    const initialized = await initialize(options, warnings);
    const document = createDocument({
        rawRouters: initialized.rawRouters,
        rawSchema: initialized.rawSchema,
        options: options,
        warnings: warnings
    });
    validateDocument(document);
    const outputDir = options.outputDir || getDefaultOutputDir();
    assertOutputDirAllowed(outputDir);
    fs.mkdirSync(outputDir, { recursive: true });
    const fileName = (NODICS.getNodeName() || NODICS.getServerName() || options.defaultServer) + '.openapi.json';
    const outputPath = path.join(outputDir, fileName);
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 4), 'utf8');
    console.log('Generated OpenAPI contract: ' + path.relative(rootDir, outputPath));
    console.log('Paths: ' + Object.keys(document.paths).length);
    console.log('Schemas: ' + Object.keys(document.components.schemas).length);
    if (warnings.length > 0) {
        warnings.forEach(warning => console.warn('Warning: ' + warning));
    }
}

module.exports = {
    addRoute: addRoute,
    collectRoutes: collectRoutes,
    createOperation: createOperation,
    createSchemaComponent: createSchemaComponent,
    createDocument: createDocument,
    createOptions: createOptions,
    initialize: initialize,
    runCli: runCli,
    validateDocument: validateDocument
};

if (require.main === module) {
    runCli(process.argv.slice(2)).catch(error => {
        console.error(error);
        process.exit(1);
    });
}
