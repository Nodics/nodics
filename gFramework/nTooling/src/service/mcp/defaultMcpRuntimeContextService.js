/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/service/mcp/defaultMcpRuntimeContextService
 * @description Explains Nodics runtime hierarchy, active-module declarations, artifact ownership, and override paths from source files without bootstrapping or redefining runtime configuration.
 * @layer tooling
 * @owner nTooling
 * @override Runtime-aware MCP adapters may enrich this report with approved runtime resolver output later, but this service must remain a source-backed explanation layer.
 */
const fs = require('fs');
const path = require('path');
const governanceService = require('./defaultMcpGovernanceService');

module.exports = {
    /**
     * Reads a file when it exists.
     * @param {string} filePath File path.
     * @returns {string} File content or empty string.
     */
    readIfExists: function (filePath) {
        return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    },

    /**
     * Extracts a simple JavaScript array assigned to a named property.
     * @param {string} source Source text.
     * @param {string} propertyName Property name.
     * @returns {string[]} Extracted string values.
     */
    extractStringArray: function (source, propertyName) {
        const pattern = new RegExp(propertyName + '\\s*:\\s*\\[([\\s\\S]*?)\\]');
        const match = source.match(pattern);
        if (!match) {
            return [];
        }
        const values = [];
        const valuePattern = /['"]([^'"]+)['"]/g;
        let valueMatch = valuePattern.exec(match[1]);
        while (valueMatch) {
            values.push(valueMatch[1]);
            valueMatch = valuePattern.exec(match[1]);
        }
        return values;
    },

    /**
     * Finds the nearest module of a given kind above a module path.
     * @param {Object[]} modules Discovered modules.
     * @param {Object} moduleObject Starting module.
     * @param {string} kind Required kind.
     * @returns {Object|null} Matching module or null.
     */
    findAncestorByKind: function (modules, moduleObject, kind) {
        if (!moduleObject) {
            return null;
        }
        const candidates = modules.filter(candidate => candidate.kind === kind && moduleObject.relativePath.indexOf(candidate.relativePath + '/') === 0);
        candidates.sort((left, right) => right.relativePath.length - left.relativePath.length);
        return candidates[0] || null;
    },

    /**
     * Builds source-backed runtime context for a selected server or path.
     * @param {Object} options Runtime context options.
     * @returns {Object} Runtime context report.
     */
    createRuntimeContext: function (options = {}) {
        const home = path.resolve(options.home || process.env.NODICS_HOME || process.cwd());
        const modules = governanceService.discoverModules(home, home, [])
            .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
        const targetPath = governanceService.resolveInsideHome(home, options.server || options.path || '.');
        let selectedModule = modules.find(moduleObject => moduleObject.name === options.server || moduleObject.relativePath === options.server) ||
            governanceService.findOwningModule(modules, targetPath);
        if (selectedModule && selectedModule.kind !== 'server') {
            selectedModule = this.findAncestorByKind(modules, selectedModule, 'server') || selectedModule;
        }
        const environmentModule = this.findAncestorByKind(modules, selectedModule, 'environment');
        const nodeModules = selectedModule ? modules.filter(moduleObject => moduleObject.kind === 'node' &&
            moduleObject.relativePath.indexOf(selectedModule.relativePath + '/') === 0) : [];
        const propertiesPath = selectedModule ? path.join(selectedModule.path, 'config', 'properties.js') : null;
        const propertiesSource = propertiesPath ? this.readIfExists(propertiesPath) : '';
        const activeGroups = this.extractStringArray(propertiesSource, 'groups');
        const activeModules = this.extractStringArray(propertiesSource, 'modules');
        const moduleNames = new Set(modules.map(moduleObject => moduleObject.name));
        return {
            contract: 'Nodics MCP Phase 3 runtime-aware context',
            sourceBacked: true,
            runtimeBootstrap: false,
            selectedServer: selectedModule && {
                name: selectedModule.name,
                path: selectedModule.relativePath,
                kind: selectedModule.kind,
                index: selectedModule.index
            },
            environment: environmentModule && {
                name: environmentModule.name,
                path: environmentModule.relativePath,
                index: environmentModule.index
            },
            nodes: nodeModules.map(moduleObject => ({
                name: moduleObject.name,
                path: moduleObject.relativePath,
                index: moduleObject.index
            })),
            activeModuleDeclaration: {
                source: propertiesPath && fs.existsSync(propertiesPath) ? governanceService.resolveInsideHome(home, propertiesPath) && propertiesPath.split(path.sep).join('/').replace(home.split(path.sep).join('/') + '/', '') : null,
                groups: activeGroups,
                modules: activeModules,
                unresolvedGroups: activeGroups.filter(groupName => !moduleNames.has(groupName)),
                unresolvedModules: activeModules.filter(moduleName => !moduleNames.has(moduleName))
            },
            overridePath: [
                'framework module defaults',
                'project module defaults',
                'environment module configuration',
                'server module activeModules and process configuration',
                'node module instance overrides',
                'tenant runtime governance where available'
            ],
            artifactOwnership: selectedModule ? governanceService.buildChangeImpact(home, modules, [selectedModule.relativePath]) : []
        };
    }
};
