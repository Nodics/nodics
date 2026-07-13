/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * @module nTest/service/generator/DefaultSchemaTestGeneratorService
 * @description Generates schema, API, scenario, CRUD, and access-policy test artifacts from effective schema and router contracts.
 * @layer service
 * @owner nTest
 * @override Project modules may override this generator to customize generated test templates while keeping source definitions authoritative.
 */
module.exports = {
    /**
     * Initializes the schema test generator during service loading.
     *
     * @param {Object} options Loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the schema test generator after service loading.
     *
     * @param {Object} options Loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Removes generated tests for a module.
     *
     * @param {Object} moduleObject Runtime module object whose `test/gen` folder should be removed.
     * @returns {Promise<boolean>} Resolves after generated tests are removed or skipped.
     */
    cleanGeneratedTests: function (moduleObject) {
        return new Promise((resolve, reject) => {
            try {
                let modulePath = this.getModulePath(moduleObject);
                if (modulePath) {
                    UTILS.removeDir(path.join(modulePath, 'test', 'gen'));
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Generates tests for every module in the effective raw schema map.
     *
     * @returns {Promise<Array<boolean>>} Resolves after all module generation tasks complete.
     */
    buildGeneratedTests: function () {
        return new Promise((resolve, reject) => {
            try {
                let generationPromises = [];
                let rawSchema = this.getEffectiveRawSchema();
                Object.keys(rawSchema || {}).forEach(moduleName => {
                    if (moduleName === 'default') {
                        return;
                    }
                    generationPromises.push(this.buildModuleGeneratedTests(moduleName, rawSchema[moduleName]));
                });
                Promise.all(generationPromises).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Generates all schema-derived test artifacts for one module.
     *
     * @param {string} moduleName Runtime module name.
     * @param {Object} moduleSchemas Raw schema definitions owned by the module.
     * @returns {Promise<boolean>} Resolves after module test generation completes or is skipped.
     */
    buildModuleGeneratedTests: function (moduleName, moduleSchemas) {
        return new Promise((resolve, reject) => {
            try {
                let moduleObject = NODICS.getModule(moduleName);
                let modulePath = this.getModulePath(moduleObject);
                if (!moduleObject || !modulePath) {
                    resolve(true);
                    return;
                }
                if (UTILS.isBlank(moduleSchemas)) {
                    resolve(true);
                    return;
                }

                let generatedSchemaDir = path.join(modulePath, 'test', 'gen', 'schema');
                fs.mkdirSync(generatedSchemaDir, { recursive: true });

                let effectiveModuleSchemas = this.resolveModuleSchemasForGeneration(moduleName, moduleSchemas);
                Object.keys(moduleSchemas).forEach(schemaName => {
                    let schemaObject = moduleSchemas[schemaName];
                    let effectiveSchemaObject = effectiveModuleSchemas[schemaName] || schemaObject;
                    this.writeSchemaContractTest({
                        moduleName: moduleName,
                        moduleObject: moduleObject,
                        schemaName: schemaName,
                        schemaObject: schemaObject,
                        effectiveSchemaObject: effectiveSchemaObject,
                        generatedSchemaDir: generatedSchemaDir
                    });
                    this.writeSchemaApiContractTest({
                        moduleName: moduleName,
                        moduleObject: moduleObject,
                        schemaName: schemaName,
                        schemaObject: schemaObject,
                        effectiveSchemaObject: effectiveSchemaObject
                    });
                    this.writeSchemaApiScenarioTest({
                        moduleName: moduleName,
                        moduleObject: moduleObject,
                        schemaName: schemaName,
                        schemaObject: schemaObject,
                        effectiveSchemaObject: effectiveSchemaObject
                    });
                    this.writeSchemaCrudScenarioTest({
                        moduleName: moduleName,
                        moduleObject: moduleObject,
                        schemaName: schemaName,
                        schemaObject: schemaObject,
                        effectiveSchemaObject: effectiveSchemaObject
                    });
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Returns the effective raw schema registry used as test generation source of truth.
     *
     * @returns {Object} Raw schema map grouped by module.
     */
    getEffectiveRawSchema: function () {
        if (SERVICE.DefaultDatabaseConfigurationService &&
            typeof SERVICE.DefaultDatabaseConfigurationService.getRawSchema === 'function') {
            return SERVICE.DefaultDatabaseConfigurationService.getRawSchema() || {};
        }
        return {};
    },

    /**
     * Resolves default schema inheritance into module schemas before fixture generation.
     *
     * @param {string} moduleName Runtime module name.
     * @param {Object} moduleSchemas Module-owned schema definitions.
     * @returns {Object} Resolved schema definitions keyed by schema name.
     */
    resolveModuleSchemasForGeneration: function (moduleName, moduleSchemas) {
        let rawSchema = this.getEffectiveRawSchema();
        let schemaMap = _.merge(_.merge({}, rawSchema.default || {}), moduleSchemas || {});
        let resolvedSchemas = {};
        Object.keys(schemaMap || {}).forEach(schemaName => {
            this.resolveSchemaForGeneration(moduleName, schemaName, schemaMap, resolvedSchemas, []);
        });
        return resolvedSchemas;
    },

    /**
     * Resolves one schema, including super-schema inheritance and circular-reference detection.
     *
     * @param {string} moduleName Runtime module name for diagnostics.
     * @param {string} schemaName Schema name to resolve.
     * @param {Object} schemaMap Combined default and module schema map.
     * @param {Object} resolvedSchemas Memoized resolved schema map.
     * @param {string[]} stack Current inheritance stack used to detect cycles.
     * @returns {Object} Resolved schema object.
     * @throws {Error} When a super schema is missing or circular.
     */
    resolveSchemaForGeneration: function (moduleName, schemaName, schemaMap, resolvedSchemas, stack) {
        if (resolvedSchemas[schemaName]) {
            return resolvedSchemas[schemaName];
        }

        let schemaObject = schemaMap[schemaName];
        if (!schemaObject) {
            throw new Error('Invalid super schema definition for generated tests: ' + moduleName + '.' + schemaName);
        }
        if (stack.includes(schemaName)) {
            throw new Error('Circular super schema definition for generated tests: ' + moduleName + '.' + stack.concat([schemaName]).join(' -> '));
        }

        if (schemaObject.super) {
            let parentSchema = this.resolveSchemaForGeneration(moduleName, schemaObject.super, schemaMap, resolvedSchemas, stack.concat([schemaName]));
            let parents = [];
            if (parentSchema.parents && parentSchema.parents.length > 0) {
                parentSchema.parents.forEach(parent => {
                    if (!parents.includes(parent)) {
                        parents.push(parent);
                    }
                });
            }
            if (!parents.includes(schemaObject.super)) {
                parents.push(schemaObject.super);
            }
            resolvedSchemas[schemaName] = _.merge(_.merge({}, parentSchema), schemaObject);
            resolvedSchemas[schemaName].parents = parents;
            return resolvedSchemas[schemaName];
        }

        resolvedSchemas[schemaName] = _.merge({}, schemaObject);
        return resolvedSchemas[schemaName];
    },

    /**
     * Writes the generated schema contract test file for one schema.
     *
     * @param {Object} options Generation options containing module, schema, and output directory details.
     * @returns {void}
     */
    writeSchemaContractTest: function (options) {
        let fileName = path.join(
            options.generatedSchemaDir,
            this.toFileSafeName(options.schemaName) + 'SchemaContract.test.js'
        );
        fs.writeFileSync(fileName, this.createSchemaContractTestContent(options), 'utf8');
    },

    /**
     * Writes the generated API contract test file for an API-eligible schema.
     *
     * @param {Object} options Generation options containing module and schema details.
     * @returns {void}
     */
    writeSchemaApiContractTest: function (options) {
        if (!this.isApiTestEligible(options.schemaObject)) {
            return;
        }

        let modulePath = this.getModulePath(options.moduleObject);
        let generatedApiDir = path.join(modulePath, 'test', 'gen', 'api');
        fs.mkdirSync(generatedApiDir, { recursive: true });

        let fileName = path.join(
            generatedApiDir,
            this.toFileSafeName(options.schemaName) + 'ApiContract.test.js'
        );
        fs.writeFileSync(fileName, this.createSchemaApiContractTestContent(options), 'utf8');
    },

    /**
     * Writes generated non-destructive API scenario tests for an API-eligible schema.
     *
     * @param {Object} options Generation options containing module and schema details.
     * @returns {void}
     */
    writeSchemaApiScenarioTest: function (options) {
        if (!this.isApiTestEligible(options.schemaObject)) {
            return;
        }

        let modulePath = this.getModulePath(options.moduleObject);
        let generatedScenarioDir = path.join(modulePath, 'test', 'gen', 'apiScenario');
        fs.mkdirSync(generatedScenarioDir, { recursive: true });

        let fileName = path.join(
            generatedScenarioDir,
            this.toFileSafeName(options.schemaName) + 'ApiScenario.test.js'
        );
        fs.writeFileSync(fileName, this.createSchemaApiScenarioTestContent(options), 'utf8');
    },

    /**
     * Writes generated destructive CRUD scenario tests for an API-eligible schema.
     *
     * @param {Object} options Generation options containing module and schema details.
     * @returns {void}
     */
    writeSchemaCrudScenarioTest: function (options) {
        if (!this.isApiTestEligible(options.schemaObject)) {
            return;
        }

        let modulePath = this.getModulePath(options.moduleObject);
        let generatedCrudDir = path.join(modulePath, 'test', 'gen', 'crud');
        fs.mkdirSync(generatedCrudDir, { recursive: true });

        let fileName = path.join(
            generatedCrudDir,
            this.toFileSafeName(options.schemaName) + 'CrudScenario.test.js'
        );
        fs.writeFileSync(fileName, this.createSchemaCrudScenarioTestContent(options), 'utf8');
    },

    /**
     * Creates JavaScript source for a generated schema contract test.
     *
     * @param {Object} options Generation options containing module, schema, and effective schema details.
     * @returns {string} JavaScript test source.
     */
    createSchemaContractTestContent: function (options) {
        let expected = {
            moduleName: options.moduleName,
            schemaName: options.schemaName,
            model: !!options.schemaObject.model,
            serviceEnabled: !!(options.schemaObject.service && options.schemaObject.service.enabled),
            routerEnabled: !!(options.schemaObject.router && options.schemaObject.router.enabled),
            super: options.schemaObject.super || null
        };

        return UTILS.getCopywriteComment() +
            '// Generated by DefaultSchemaTestGeneratorService. Do not edit directly.\n' +
            '// Override the generator in a project module to customize generated schema tests.\n\n' +
            'const assert = require(\'assert\');\n' +
            'const expected = ' + JSON.stringify(expected, null, 4) + ';\n' +
            '\n' +
            'assert(expected.moduleName, \'Generated schema contract must include moduleName\');\n' +
            'assert(expected.schemaName, \'Generated schema contract must include schemaName\');\n' +
            'assert.strictEqual(typeof expected.model, \'boolean\');\n' +
            'assert.strictEqual(typeof expected.serviceEnabled, \'boolean\');\n' +
            'assert.strictEqual(typeof expected.routerEnabled, \'boolean\');\n\n' +
            'console.log(`Generated schema contract validated: ${expected.moduleName}.${expected.schemaName}`);\n';
    },

    /**
     * Creates JavaScript source for a generated API route contract test.
     *
     * @param {Object} options Generation options containing module and schema details.
     * @returns {string} JavaScript test source.
     */
    createSchemaApiContractTestContent: function (options) {
        let alias = ((options.schemaObject.router && options.schemaObject.router.alias) || options.schemaName).toLowerCase();
        let controller = 'Default' + options.schemaName.toUpperCaseEachWord() + 'Controller';
        let expectedRoutes = this.createExpectedApiRoutes(alias, controller);
        let expected = {
            moduleName: options.moduleName,
            schemaName: options.schemaName,
            alias: alias,
            controller: controller,
            routes: expectedRoutes
        };

        return UTILS.getCopywriteComment() +
            '// Generated by DefaultSchemaTestGeneratorService. Do not edit directly.\n' +
            '// Override the generator in a project module to customize generated API tests.\n\n' +
            'const assert = require(\'assert\');\n\n' +
            'const expected = ' + JSON.stringify(expected, null, 4) + ';\n\n' +
            'assert(expected.moduleName, \'Generated API contract must include moduleName\');\n' +
            'assert(expected.schemaName, \'Generated API contract must include schemaName\');\n' +
            'assert(expected.alias, \'Generated API contract must include alias\');\n' +
            'assert(expected.controller, \'Generated API contract must include controller\');\n' +
            'assert(Array.isArray(expected.routes), \'Generated API contract must include routes\');\n' +
            'assert(expected.routes.length > 0, \'Generated API contract must include at least one route\');\n' +
            'expected.routes.forEach((route) => {\n' +
            '    assert(route.key, \'Generated API route must include key\');\n' +
            '    assert(route.method, \'Generated API route must include method\');\n' +
            '    assert.strictEqual(route.controller, expected.controller);\n' +
            '    assert(route.operation, \'Generated API route must include operation\');\n' +
            '    assert.strictEqual(typeof route.secured, \'boolean\');\n' +
            '});\n\n' +
            'console.log(`Generated API contract validated: ${expected.moduleName}.${expected.schemaName} (${expected.routes.length} routes)`);\n';
    },

    /**
     * Creates JavaScript source for generated non-destructive API scenario tests.
     *
     * @param {Object} options Generation options containing module and schema details.
     * @returns {string} JavaScript test source.
     */
    createSchemaApiScenarioTestContent: function (options) {
        let alias = ((options.schemaObject.router && options.schemaObject.router.alias) || options.schemaName).toLowerCase();
        let controller = 'Default' + options.schemaName.toUpperCaseEachWord() + 'Controller';
        let scenarios = this.createNonDestructiveApiScenarios(alias, controller);
        let expected = {
            moduleName: options.moduleName,
            schemaName: options.schemaName,
            alias: alias,
            controller: controller,
            scenarios: scenarios
        };

        return UTILS.getCopywriteComment() +
            '// Generated by DefaultSchemaTestGeneratorService. Do not edit directly.\n' +
            '// Override the generator in a project module to customize generated API scenario tests.\n\n' +
            'const assert = require(\'assert\');\n\n' +
            'const expected = ' + JSON.stringify(expected, null, 4) + ';\n\n' +
            'assert(expected.moduleName, \'Generated API scenario must include moduleName\');\n' +
            'assert(expected.schemaName, \'Generated API scenario must include schemaName\');\n' +
            'assert(expected.alias, \'Generated API scenario must include alias\');\n' +
            'assert(expected.controller, \'Generated API scenario must include controller\');\n' +
            'assert(Array.isArray(expected.scenarios), \'Generated API scenario must include scenarios\');\n' +
            'assert(expected.scenarios.length > 0, \'Generated API scenario must include at least one non-destructive scenario\');\n' +
            'expected.scenarios.forEach((scenario) => {\n' +
            '    assert(scenario.name, \'Generated API scenario must include name\');\n' +
            '    assert(scenario.route.key, \'Generated API scenario route must include key\');\n' +
            '    assert([\'get\', \'post\'].includes(scenario.route.method), `Scenario ${scenario.name} must be non-destructive`);\n' +
            '    assert.strictEqual(scenario.route.controller, expected.controller);\n' +
            '    assert(scenario.route.operation, \'Generated API scenario route must include operation\');\n' +
            '    assert.strictEqual(scenario.request.headers.Authorization, \'Bearer <token>\');\n' +
            '    assert.strictEqual(scenario.request.headers.tenant, \'<activeTenant>\');\n' +
            '    assert.strictEqual(scenario.request.headers[\'x-enterprise-code\'], \'<enterpriseCode>\');\n' +
            '    assert.strictEqual(scenario.request.query.recursive, false);\n' +
            '    assert.strictEqual(typeof scenario.request.params, \'object\');\n' +
            '    assert.strictEqual(typeof scenario.request.body, \'object\');\n' +
            '    assert.strictEqual(scenario.mutation, false);\n' +
            '});\n\n' +
            'console.log(`Generated API scenarios validated: ${expected.moduleName}.${expected.schemaName} (${expected.scenarios.length} scenarios)`);\n';
    },

    /**
     * Creates JavaScript source for generated destructive CRUD and access-policy scenario tests.
     *
     * @param {Object} options Generation options containing module, schema, and effective schema details.
     * @returns {string} JavaScript test source.
     */
    createSchemaCrudScenarioTestContent: function (options) {
        let alias = ((options.schemaObject.router && options.schemaObject.router.alias) || options.schemaName).toLowerCase();
        let controller = 'Default' + options.schemaName.toUpperCaseEachWord() + 'Controller';
        let fixtureSchemaObject = options.effectiveSchemaObject || options.schemaObject;
        let scenarios = this.createDestructiveCrudScenarios(alias, controller, fixtureSchemaObject);
        let lifecycle = this.createDestructiveCrudLifecycle(alias, controller, fixtureSchemaObject);
        let accessPolicyScenarios = this.createCrudAccessPolicyScenarios(options.moduleName, options.schemaName, alias, controller, fixtureSchemaObject);
        let expected = {
            moduleName: options.moduleName,
            urlPrefix: (options.moduleObject.metaData && options.moduleObject.metaData.prefix) || options.moduleName,
            schemaName: options.schemaName,
            alias: alias,
            controller: controller,
            destructive: true,
            execution: 'explicit-only',
            testTenant: '<testTenant>',
            scenarios: scenarios,
            lifecycle: lifecycle,
            accessPolicyScenarios: accessPolicyScenarios
        };

        return UTILS.getCopywriteComment() +
            '// Generated by DefaultSchemaTestGeneratorService. Do not edit directly.\n' +
            '// Override the generator in a project module to customize generated destructive CRUD tests.\n' +
            '// These tests describe mutation scenarios and must only be executed by explicit CRUD test commands.\n\n' +
            'const assert = require(\'assert\');\n\n' +
            'const expected = ' + JSON.stringify(expected, null, 4) + ';\n\n' +
            'assert(expected.moduleName, \'Generated CRUD scenario must include moduleName\');\n' +
            'assert(expected.urlPrefix, \'Generated CRUD scenario must include urlPrefix\');\n' +
            'assert(expected.schemaName, \'Generated CRUD scenario must include schemaName\');\n' +
            'assert(expected.alias, \'Generated CRUD scenario must include alias\');\n' +
            'assert(expected.controller, \'Generated CRUD scenario must include controller\');\n' +
            'assert.strictEqual(expected.destructive, true);\n' +
            'assert.strictEqual(expected.execution, \'explicit-only\');\n' +
            'assert.strictEqual(expected.testTenant, \'<testTenant>\');\n' +
            'assert(Array.isArray(expected.scenarios), \'Generated CRUD scenario must include scenarios\');\n' +
            'assert(Array.isArray(expected.lifecycle), \'Generated CRUD scenario must include lifecycle\');\n' +
            'assert(Array.isArray(expected.accessPolicyScenarios), \'Generated CRUD scenario must include access policy scenarios\');\n' +
            'assert(expected.scenarios.length >= 4, \'Generated CRUD scenario must include create, update, delete, and cleanup scenarios\');\n' +
            'assert(expected.lifecycle.length >= 7, \'Generated CRUD lifecycle must include cleanup, create, read, update, read, delete, and verify steps\');\n' +
            'assert(expected.accessPolicyScenarios.length >= 4, \'Generated CRUD access policy scenarios must include read, create, update, and delete\');\n' +
            'assert(expected.scenarios.some((scenario) => scenario.operation === \'save\'), \'CRUD scenarios must include save\');\n' +
            'assert(expected.scenarios.some((scenario) => scenario.operation === \'update\'), \'CRUD scenarios must include update\');\n' +
            'assert(expected.scenarios.some((scenario) => scenario.operation === \'removeByCode\' || scenario.operation === \'remove\'), \'CRUD scenarios must include delete\');\n' +
            'expected.scenarios.forEach((scenario) => {\n' +
            '    assert(scenario.name, \'Generated CRUD scenario must include name\');\n' +
            '    assert(scenario.route.key, \'Generated CRUD route must include key\');\n' +
            '    assert([\'put\', \'patch\', \'delete\'].includes(scenario.route.method), `Scenario ${scenario.name} must use a mutation method`);\n' +
            '    assert.strictEqual(scenario.route.controller, expected.controller);\n' +
            '    assert(scenario.operation, \'Generated CRUD scenario must include operation\');\n' +
            '    assert.strictEqual(scenario.request.headers.Authorization, \'Bearer <token>\');\n' +
            '    assert.strictEqual(scenario.request.headers.tenant, \'<testTenant>\');\n' +
            '    assert.strictEqual(scenario.request.headers[\'x-enterprise-code\'], \'<enterpriseCode>\');\n' +
            '    assert.strictEqual(typeof scenario.request.params, \'object\');\n' +
            '    assert.strictEqual(typeof scenario.request.body, \'object\');\n' +
            '    assert.strictEqual(scenario.mutation, true);\n' +
            '});\n\n' +
            'expected.lifecycle.forEach((step) => {\n' +
            '    assert(step.name, \'Generated CRUD lifecycle step must include name\');\n' +
            '    assert(step.route.key, \'Generated CRUD lifecycle step route must include key\');\n' +
            '    assert(step.request, \'Generated CRUD lifecycle step must include request\');\n' +
            '    assert.strictEqual(typeof step.mutation, \'boolean\');\n' +
            '});\n\n' +
            'expected.accessPolicyScenarios.forEach((scenario) => {\n' +
            '    assert(scenario.name, \'Generated access policy scenario must include name\');\n' +
            '    assert([\'read\', \'create\', \'update\', \'delete\'].includes(scenario.policyAction), `Unsupported generated access policy action ${scenario.policyAction}`);\n' +
            '    assert(scenario.route && scenario.route.key, \'Generated access policy scenario must include route\');\n' +
            '    assert(scenario.policy && scenario.policy.moduleName === expected.moduleName, \'Generated access policy scenario must include module policy context\');\n' +
            '    assert(scenario.policy.schemaName === expected.schemaName, \'Generated access policy scenario must include schema policy context\');\n' +
            '    assert(scenario.policy.propertyName, \'Generated access policy scenario must include property policy context\');\n' +
            '    assert(scenario.expected, \'Generated access policy scenario must include expected outcome\');\n' +
            '});\n' +
            'assert(expected.accessPolicyScenarios.some((scenario) => scenario.policyAction === \'read\' && scenario.expected.responseFiltering === true), \'Generated access policy scenarios must cover read filtering\');\n' +
            'assert(expected.accessPolicyScenarios.some((scenario) => scenario.policyAction === \'create\' && scenario.expected.blocked === true), \'Generated access policy scenarios must cover create blocking\');\n' +
            'assert(expected.accessPolicyScenarios.some((scenario) => scenario.policyAction === \'update\' && scenario.expected.blocked === true), \'Generated access policy scenarios must cover update blocking\');\n' +
            'assert(expected.accessPolicyScenarios.some((scenario) => scenario.policyAction === \'delete\' && scenario.policy.propertyName === \'*\' && scenario.expected.blocked === true), \'Generated access policy scenarios must cover schema-level delete blocking\');\n\n' +
            'module.exports = expected;\n\n' +
            'console.log(`Generated destructive CRUD scenarios validated: ${expected.moduleName}.${expected.schemaName} (${expected.scenarios.length} scenarios)`);\n';
    },

    /**
     * Builds expected API route metadata from default schema router templates.
     *
     * @param {string} alias Schema route alias.
     * @param {string} controller Generated controller service name.
     * @returns {Object[]} Expected route definitions for the schema.
     */
    createExpectedApiRoutes: function (alias, controller) {
        let defaultRouters = this.getDefaultSchemaRouters();
        let routes = [];
        Object.keys(defaultRouters || {}).forEach(groupName => {
            if (groupName === 'options') {
                return;
            }
            let group = defaultRouters[groupName] || {};
            Object.keys(group).forEach(routerName => {
                if (routerName === 'options') {
                    return;
                }
                let routerDef = group[routerName];
                if (routerDef && routerDef.key && routerDef.method) {
                    routes.push({
                        routerName: routerName,
                        key: routerDef.key.replaceAll('schemaName', alias),
                        method: String(routerDef.method).toLowerCase(),
                        apiVersion: routerDef.apiVersion || 'v0',
                        controller: String(routerDef.controller || '').replaceAll('DefaultctrlName', controller),
                        operation: routerDef.operation,
                        secured: routerDef.secured === undefined ? false : !!routerDef.secured
                    });
                }
            });
        });
        return routes;
    },

    /**
     * Builds non-destructive API scenarios from generated route metadata.
     *
     * @param {string} alias Schema route alias.
     * @param {string} controller Generated controller service name.
     * @returns {Object[]} Scenario definitions for GET/POST read-style routes.
     */
    createNonDestructiveApiScenarios: function (alias, controller) {
        return this.createExpectedApiRoutes(alias, controller)
            .filter(route => this.isNonDestructiveRoute(route))
            .map(route => {
                return {
                    name: route.routerName,
                    route: route,
                    request: this.createScenarioRequest(route),
                    mutation: false
                };
            });
    },

    /**
     * Builds destructive CRUD mutation scenarios from generated route metadata.
     *
     * @param {string} alias Schema route alias.
     * @param {string} controller Generated controller service name.
     * @param {Object} schemaObject Effective schema used to build fixtures.
     * @returns {Object[]} Scenario definitions for save, update, and remove routes.
     */
    createDestructiveCrudScenarios: function (alias, controller, schemaObject) {
        let mutationRoutes = this.createExpectedApiRoutes(alias, controller)
            .filter(route => this.isDestructiveCrudRoute(route));
        let createModel = this.createCrudModelFixture(alias, schemaObject, 'create');
        let updateModel = this.createCrudModelFixture(alias, schemaObject, 'update');

        return mutationRoutes.map(route => {
            return {
                name: route.routerName,
                operation: route.operation,
                route: route,
                request: this.createCrudScenarioRequest(route, createModel, updateModel),
                mutation: true,
                cleanup: ['save', 'saveAll', 'update'].includes(route.operation)
            };
        });
    },

    /**
     * Builds an ordered CRUD lifecycle scenario using create, read, update, delete, and verify steps.
     *
     * @param {string} alias Schema route alias.
     * @param {string} controller Generated controller service name.
     * @param {Object} schemaObject Effective schema used to build fixtures.
     * @returns {Object[]} Ordered lifecycle step definitions.
     */
    createDestructiveCrudLifecycle: function (alias, controller, schemaObject) {
        let routes = this.createExpectedApiRoutes(alias, controller);
        let createModel = this.createCrudModelFixture(alias, schemaObject, 'create');
        let updateModel = this.createCrudModelFixture(alias, schemaObject, 'update');
        let saveRoute = this.findRoute(routes, 'save', 'put');
        let updateRoute = this.findRoute(routes, 'update', 'patch');
        let getByCodeRoute = this.findRouteByRouterName(routes, 'getByCode') || this.findRoute(routes, 'get', 'get');
        let deleteRoute = this.findRouteByRouterName(routes, 'removeByCode') ||
            this.findRouteByRouterName(routes, 'remove') ||
            this.findRoute(routes, 'removeByCode', 'delete') ||
            this.findRoute(routes, 'remove', 'delete');

        return [
            this.createCrudLifecycleStep('cleanupBefore', deleteRoute, createModel, updateModel, true, true),
            this.createCrudLifecycleStep('create', saveRoute, createModel, updateModel, false, false),
            this.createCrudLifecycleStep('readAfterCreate', getByCodeRoute, createModel, updateModel, false, false),
            this.createCrudLifecycleStep('update', updateRoute, createModel, updateModel, false, false),
            this.createCrudLifecycleStep('readAfterUpdate', getByCodeRoute, createModel, updateModel, false, false),
            this.createCrudLifecycleStep('delete', deleteRoute, createModel, updateModel, false, false),
            this.createCrudLifecycleStep('verifyDeleted', getByCodeRoute, createModel, updateModel, false, true)
        ].filter(step => !!step);
    },

    /**
     * Builds generated access-policy scenarios for CRUD route behavior.
     *
     * @param {string} moduleName Runtime module name.
     * @param {string} schemaName Schema name.
     * @param {string} alias Schema route alias.
     * @param {string} controller Generated controller service name.
     * @param {Object} schemaObject Effective schema used to choose protected properties.
     * @returns {Object[]} Access-policy scenario definitions.
     */
    createCrudAccessPolicyScenarios: function (moduleName, schemaName, alias, controller, schemaObject) {
        let routes = this.createExpectedApiRoutes(alias, controller);
        let createModel = this.createCrudModelFixture(alias, schemaObject, 'create');
        let updateModel = this.createCrudModelFixture(alias, schemaObject, 'update');
        let protectedProperty = this.getAccessPolicyFixtureProperty(schemaObject);
        let readRoute = this.findRouteByRouterName(routes, 'getByCode') || this.findRoute(routes, 'get', 'get');
        let createRoute = this.findRoute(routes, 'save', 'put');
        let updateRoute = this.findRoute(routes, 'update', 'patch');
        let deleteRoute = this.findRouteByRouterName(routes, 'removeByCode') ||
            this.findRouteByRouterName(routes, 'remove') ||
            this.findRoute(routes, 'removeByCode', 'delete') ||
            this.findRoute(routes, 'remove', 'delete');
        return [
            this.createCrudAccessPolicyScenario(moduleName, schemaName, 'readFilteredProperty', 'read', readRoute, createModel, updateModel, protectedProperty, {
                effect: 'MASK',
                responseFiltering: true,
                blocked: false
            }),
            this.createCrudAccessPolicyScenario(moduleName, schemaName, 'createBlockedProperty', 'create', createRoute, createModel, updateModel, protectedProperty, {
                effect: 'DENY',
                responseFiltering: false,
                blocked: true
            }),
            this.createCrudAccessPolicyScenario(moduleName, schemaName, 'updateBlockedProperty', 'update', updateRoute, createModel, updateModel, protectedProperty, {
                effect: 'READONLY',
                responseFiltering: false,
                blocked: true
            }),
            this.createCrudAccessPolicyScenario(moduleName, schemaName, 'deleteBlockedSchema', 'delete', deleteRoute, createModel, updateModel, '*', {
                effect: 'DENY',
                responseFiltering: false,
                blocked: true
            })
        ].filter(scenario => !!scenario);
    },

    /**
     * Builds one access-policy scenario for a CRUD route.
     *
     * @param {string} moduleName Runtime module name.
     * @param {string} schemaName Schema name.
     * @param {string} name Scenario name.
     * @param {string} policyAction Access-policy action being validated.
     * @param {Object} route Route metadata for the scenario.
     * @param {Object} createModel Create fixture.
     * @param {Object} updateModel Update fixture.
     * @param {string} propertyName Protected property or `*` for schema-level policy.
     * @param {Object} expected Expected enforcement outcome.
     * @returns {Object|null} Scenario definition, or null when the route is unavailable.
     */
    createCrudAccessPolicyScenario: function (moduleName, schemaName, name, policyAction, route, createModel, updateModel, propertyName, expected) {
        if (!route) {
            return null;
        }
        return {
            name: name,
            policyAction: policyAction,
            route: route,
            request: this.createAccessPolicyScenarioRequest(route, createModel, updateModel, propertyName),
            policy: {
                moduleName: moduleName,
                schemaName: schemaName,
                propertyName: propertyName,
                actions: [policyAction],
                userGroups: ['<restrictedUserGroup>'],
                appliesToTenants: ['<testTenant>']
            },
            expected: expected
        };
    },

    /**
     * Builds the request payload used by a generated access-policy scenario.
     *
     * @param {Object} route Route metadata for the scenario.
     * @param {Object} createModel Create fixture.
     * @param {Object} updateModel Update fixture.
     * @param {string} propertyName Protected property or `*`.
     * @returns {Object} Request definition with headers, params, query, and body.
     */
    createAccessPolicyScenarioRequest: function (route, createModel, updateModel, propertyName) {
        let request = this.createCrudLifecycleRequest(route, createModel, updateModel);
        if (propertyName && propertyName !== '*' && route.operation === 'save') {
            request.body[propertyName] = createModel[propertyName] !== undefined ? createModel[propertyName] : '<protectedValue>';
        }
        if (propertyName && propertyName !== '*' && route.operation === 'update') {
            request.body.model = request.body.model || {};
            request.body.model[propertyName] = updateModel[propertyName] !== undefined ? updateModel[propertyName] : '<protectedValue>';
        }
        return request;
    },

    /**
     * Builds one ordered CRUD lifecycle step.
     *
     * @param {string} name Step name.
     * @param {Object} route Route metadata for the step.
     * @param {Object} createModel Create fixture.
     * @param {Object} updateModel Update fixture.
     * @param {boolean} optional Whether the step may be skipped by a runner.
     * @param {boolean} expectMissing Whether the expected result is absence.
     * @returns {Object|null} Lifecycle step definition, or null when the route is unavailable.
     */
    createCrudLifecycleStep: function (name, route, createModel, updateModel, optional, expectMissing) {
        if (!route) {
            return null;
        }
        return {
            name: name,
            operation: route.operation,
            route: route,
            request: this.createCrudLifecycleRequest(route, createModel, updateModel),
            mutation: ['put', 'patch', 'delete'].includes(route.method),
            optional: !!optional,
            expectMissing: !!expectMissing
        };
    },

    /**
     * Builds request data for a CRUD lifecycle step.
     *
     * @param {Object} route Route metadata for the step.
     * @param {Object} createModel Create fixture.
     * @param {Object} updateModel Update fixture.
     * @returns {Object} Request definition with headers, params, query, and body.
     */
    createCrudLifecycleRequest: function (route, createModel, updateModel) {
        if (['put', 'patch', 'delete'].includes(route.method)) {
            return this.createCrudScenarioRequest(route, createModel, updateModel);
        }
        return {
            headers: {
                Authorization: 'Bearer <token>',
                tenant: '<testTenant>',
                'x-enterprise-code': '<enterpriseCode>'
            },
            params: this.createCrudRouteParams(route.key, createModel),
            query: {
                recursive: false
            },
            body: {}
        };
    },

    /**
     * Finds a route by operation and HTTP method.
     *
     * @param {Object[]} routes Route metadata list.
     * @param {string} operation Nodics operation name.
     * @param {string} method Lowercase HTTP method.
     * @returns {Object|undefined} Matching route definition.
     */
    findRoute: function (routes, operation, method) {
        return (routes || []).find(route => route.operation === operation && route.method === method);
    },

    /**
     * Finds a route by generated router name.
     *
     * @param {Object[]} routes Route metadata list.
     * @param {string} routerName Router name.
     * @returns {Object|undefined} Matching route definition.
     */
    findRouteByRouterName: function (routes, routerName) {
        return (routes || []).find(route => route.routerName === routerName);
    },

    /**
     * Determines whether a route mutates data and belongs in CRUD scenario generation.
     *
     * @param {Object} route Route metadata.
     * @returns {boolean} True for save, update, and remove mutation routes.
     */
    isDestructiveCrudRoute: function (route) {
        return route &&
            ['put', 'patch', 'delete'].includes(route.method) &&
            ['save', 'saveAll', 'update', 'remove', 'removeById', 'removeByCode'].includes(route.operation);
    },

    /**
     * Determines whether a route is safe for non-destructive API scenario generation.
     *
     * @param {Object} route Route metadata.
     * @returns {boolean} True for read-style GET/POST routes.
     */
    isNonDestructiveRoute: function (route) {
        return route &&
            ['get', 'post'].includes(route.method) &&
            !['save', 'saveAll', 'update', 'remove', 'removeById', 'removeByCode', 'doSave', 'doBulk', 'doRemove', 'doRemoveIndex'].includes(route.operation);
    },

    /**
     * Builds request data for a non-destructive API scenario.
     *
     * @param {Object} route Route metadata.
     * @returns {Object} Request definition with headers, params, query, and body.
     */
    createScenarioRequest: function (route) {
        return {
            headers: {
                Authorization: 'Bearer <token>',
                tenant: '<activeTenant>',
                'x-enterprise-code': '<enterpriseCode>'
            },
            params: this.createRouteParams(route.key),
            query: {
                recursive: false
            },
            body: route.method === 'post' ? this.createPostScenarioBody(route) : {}
        };
    },

    /**
     * Builds request data for a destructive CRUD scenario.
     *
     * @param {Object} route Route metadata.
     * @param {Object} createModel Create fixture.
     * @param {Object} updateModel Update fixture.
     * @returns {Object} Request definition with headers, params, query, and body.
     */
    createCrudScenarioRequest: function (route, createModel, updateModel) {
        return {
            headers: {
                Authorization: 'Bearer <token>',
                tenant: '<testTenant>',
                'x-enterprise-code': '<enterpriseCode>'
            },
            params: this.createCrudRouteParams(route.key, createModel),
            query: {},
            body: this.createCrudScenarioBody(route, createModel, updateModel)
        };
    },

    /**
     * Builds route params for CRUD routes from route-key placeholders.
     *
     * @param {string} routeKey Route key containing optional `:param` segments.
     * @param {Object} createModel Create fixture used for code params.
     * @returns {Object} Route params object.
     */
    createCrudRouteParams: function (routeKey, createModel) {
        let params = {};
        String(routeKey).split('/').forEach(part => {
            if (part === ':id') {
                params.id = '<createdModelId>';
            } else if (part === ':code') {
                params.code = createModel.code;
            } else if (part.startsWith(':')) {
                params[part.substring(1)] = '<' + part.substring(1) + '>';
            }
        });
        return params;
    },

    /**
     * Builds request body data for a CRUD mutation route.
     *
     * @param {Object} route Route metadata.
     * @param {Object} createModel Create fixture.
     * @param {Object} updateModel Update fixture.
     * @returns {Object|Object[]} Request body payload.
     */
    createCrudScenarioBody: function (route, createModel, updateModel) {
        if (route.operation === 'save') {
            return createModel;
        }
        if (route.operation === 'saveAll') {
            return [createModel];
        }
        if (route.operation === 'update') {
            return {
                options: {
                    returnModified: true
                },
                query: {
                    code: createModel.code
                },
                model: updateModel
            };
        }
        if (route.operation === 'remove') {
            return {
                options: {
                    returnModified: true
                },
                query: {
                    code: createModel.code
                }
            };
        }
        if (route.operation === 'removeById' && Object.keys(this.createRouteParams(route.key)).length === 0) {
            return {
                options: {
                    returnModified: true
                },
                ids: ['<createdModelId>']
            };
        }
        if (route.operation === 'removeByCode' && Object.keys(this.createRouteParams(route.key)).length === 0) {
            return {
                options: {
                    returnModified: true
                },
                codes: [createModel.code]
            };
        }
        return {};
    },

    /**
     * Builds generic route params from route-key placeholders.
     *
     * @param {string} routeKey Route key containing optional `:param` segments.
     * @returns {Object} Route params object.
     */
    createRouteParams: function (routeKey) {
        let params = {};
        String(routeKey).split('/').forEach(part => {
            if (part.startsWith(':')) {
                params[part.substring(1)] = '<' + part.substring(1) + '>';
            }
        });
        return params;
    },

    /**
     * Builds POST request bodies for non-destructive generated API scenarios.
     *
     * @param {Object} route Route metadata.
     * @returns {Object} Request body payload.
     */
    createPostScenarioBody: function (route) {
        let body = {
            options: {},
            query: {}
        };
        if (route.operation === 'get') {
            body.options = {
                recursive: false,
                pageSize: 10,
                pageNumber: 0
            };
        } else if (route.operation === 'doExists' || route.operation === 'doGet') {
            body.query = {
                id: '<id>'
            };
        } else if (route.operation === 'doSearch') {
            body.query = {
                match_all: {}
            };
        }
        return body;
    },

    /**
     * Builds a create or update fixture model from schema property definitions.
     *
     * @param {string} alias Schema route alias.
     * @param {Object} schemaObject Effective schema definition.
     * @param {string} phase Fixture phase, usually `create` or `update`.
     * @returns {Object} Fixture model.
     */
    createCrudModelFixture: function (alias, schemaObject, phase) {
        let code = 'ntest_' + alias + '_<runId>';
        let model = {
            code: code,
            active: true,
            description: 'Generated ' + phase + ' CRUD test fixture for ' + alias
        };

        Object.keys(schemaObject.definition || {}).forEach(propertyName => {
            let propertyObject = schemaObject.definition[propertyName] || {};
            if (!propertyObject.required ||
                propertyObject.default !== undefined ||
                this.hasFixturePropertyValue(model, propertyName)) {
                return;
            }
            this.setFixturePropertyValue(
                model,
                propertyName,
                this.createPropertyFixtureValue(propertyName, propertyObject, phase, schemaObject, alias)
            );
        });

        if (phase === 'update') {
            model.description = 'Generated updated CRUD test fixture for ' + alias;
        }
        return model;
    },

    /**
     * Checks whether a nested fixture property already has a value.
     *
     * @param {Object} model Fixture model.
     * @param {string} propertyPath Dot-separated property path.
     * @returns {boolean} True when the property exists.
     */
    hasFixturePropertyValue: function (model, propertyPath) {
        let parts = String(propertyPath).split('.');
        let current = model;
        for (let index = 0; index < parts.length; index++) {
            if (current === undefined || current === null || current[parts[index]] === undefined) {
                return false;
            }
            current = current[parts[index]];
        }
        return true;
    },

    /**
     * Sets a nested fixture property value, creating objects along the path.
     *
     * @param {Object} model Fixture model to mutate.
     * @param {string} propertyPath Dot-separated property path.
     * @param {*} value Value to assign.
     * @returns {void}
     */
    setFixturePropertyValue: function (model, propertyPath, value) {
        let parts = String(propertyPath).split('.');
        let current = model;
        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                current[part] = value;
                return;
            }
            if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) {
                current[part] = {};
            }
            current = current[part];
        });
    },

    /**
     * Selects a representative schema property for generated access-policy scenarios.
     *
     * @param {Object} schemaObject Effective schema definition.
     * @returns {string} Property name, or a placeholder when no schema properties exist.
     */
    getAccessPolicyFixtureProperty: function (schemaObject) {
        let definition = schemaObject.definition || {};
        if (definition.description) {
            return 'description';
        }
        if (definition.code) {
            return 'code';
        }
        let properties = Object.keys(definition);
        return properties.length > 0 ? properties[0] : '<policyControlledProperty>';
    },

    /**
     * Creates a fixture value for a required schema property.
     *
     * @param {string} propertyName Schema property name.
     * @param {Object} propertyObject Schema property definition.
     * @param {string} phase Fixture phase, usually `create` or `update`.
     * @param {Object} schemaObject Effective schema definition.
     * @param {string} alias Schema route alias.
     * @returns {*} Fixture value.
     */
    createPropertyFixtureValue: function (propertyName, propertyObject, phase, schemaObject, alias) {
        if (Array.isArray(propertyObject.enum) && propertyObject.enum.length > 0) {
            return propertyObject.enum[0];
        }
        if (propertyObject.default !== undefined && typeof propertyObject.default !== 'function') {
            return propertyObject.default;
        }
        if (schemaObject && schemaObject.refSchema && schemaObject.refSchema[propertyName]) {
            return this.createReferenceFixtureValue(propertyName, schemaObject.refSchema[propertyName], phase, alias);
        }

        let type = String(propertyObject.type || 'string').toLowerCase();
        if (type === 'bool' || type === 'boolean') {
            return true;
        }
        if (type === 'int' || type === 'integer' || type === 'number' || type === 'float' || type === 'double') {
            return phase === 'update' ? 2 : 1;
        }
        if (type === 'array') {
            return [];
        }
        if (type === 'object') {
            return {};
        }
        if (type === 'date') {
            return '<timestamp>';
        }
        return 'ntest_' + propertyName + '_<runId>';
    },

    /**
     * Creates a fixture value for a referenced schema property.
     *
     * @param {string} propertyName Schema property name.
     * @param {Object} refObject Reference schema metadata.
     * @param {string} phase Fixture phase, usually `create` or `update`.
     * @param {string} alias Schema route alias.
     * @returns {Object|Array} Reference fixture value.
     */
    createReferenceFixtureValue: function (propertyName, refObject, phase, alias) {
        if (refObject.type === 'many') {
            if (propertyName === 'userGroups') {
                return ['userGroup'];
            }
            return [];
        }

        let nestedModel = {
            code: 'ntest_' + propertyName + '_' + alias + '_<runId>',
            active: true,
            description: 'Generated ' + phase + ' referenced fixture for ' + propertyName
        };
        if (propertyName === 'password' || refObject.schemaName === 'password') {
            nestedModel.loginId = 'ntest_' + alias + '_<runId>';
            nestedModel.password = 'nodics';
        }
        return nestedModel;
    },

    /**
     * Loads default schema router templates used by generated API tests.
     *
     * @returns {Object} Default schema router definitions.
     */
    getDefaultSchemaRouters: function () {
        let routers = SERVICE.DefaultFilesLoaderService.loadRouterFiles('/src/router/router.js');
        return routers.default || {};
    },

    /**
     * Determines whether a schema should receive generated API tests.
     *
     * @param {Object} schemaObject Schema definition.
     * @returns {boolean} True when both service and router are enabled.
     */
    isApiTestEligible: function (schemaObject) {
        return !!(schemaObject &&
            schemaObject.service && schemaObject.service.enabled &&
            schemaObject.router && schemaObject.router.enabled);
    },

    /**
     * Converts a schema name or value into a generated-test file-safe name.
     *
     * @param {*} value Value to sanitize.
     * @returns {string} File-safe name.
     */
    toFileSafeName: function (value) {
        return String(value).replace(/[^a-zA-Z0-9_$-]/g, '_');
    },

    /**
     * Returns the filesystem path for a runtime module object.
     *
     * @param {Object} moduleObject Runtime module object.
     * @returns {string|null} Module path or null when unavailable.
     */
    getModulePath: function (moduleObject) {
        return moduleObject ? moduleObject.path || moduleObject.modulePath : null;
    }
};
