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
const defaultProperties = require('../../config/properties');

const frameworkHome = path.resolve(__dirname, '../../../..');
const toolingModulePath = path.resolve(__dirname, '../..');

/**
 * @module nTooling/service/defaultToolingCommandService
 * @description Discovers non-runtime tooling command contributions from module-shaped packages, orders them by Nodics module index, applies explicit handler override governance, and executes commands against a selected project home.
 * @layer tooling
 * @owner nTooling
 * @override Projects extend commands through `config/properties.js` under `tooling.commands`; changing an existing handler requires `$override.mode: 'replace'` so customization remains intentional and traceable.
 */
module.exports = {
    /**
     * Reads a `--name=value` command-line option.
     * @param {string[]} args Command arguments.
     * @param {string} name Option name.
     * @param {*} defaultValue Fallback value.
     * @returns {*} Parsed value or the fallback.
     */
    readOption: function (args, name, defaultValue) {
        const prefix = name + '=';
        const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
        return match ? match.slice(prefix.length) : defaultValue;
    },

    /**
     * Resolves the consuming Nodics project rather than assuming the framework source is the project root.
     * @param {string[]} args Command arguments.
     * @returns {string} Absolute project home.
     */
    resolveHome: function (args) {
        const configuredHome = this.readOption(args, '--home', process.env.NODICS_HOME || '');
        return configuredHome ? path.resolve(configuredHome) : process.cwd();
    },

    /**
     * Returns source-controlled discovery defaults for non-runtime tooling scans.
     * @returns {Object} Discovery policy from nTooling configuration.
     */
    getDiscoveryConfiguration: function () {
        return _.get(defaultProperties, 'tooling.discovery', {});
    },

    /**
     * Returns directories excluded from module discovery.
     * @returns {Set<string>} Directory names to skip.
     */
    getIgnoredDirectories: function () {
        const discovery = this.getDiscoveryConfiguration();
        return new Set(discovery.ignoredDirectories || []);
    },

    /**
     * Decides whether a directory should be traversed during module discovery.
     * @param {fs.Dirent} entry Directory entry.
     * @returns {boolean} Whether the directory should be visited.
     */
    shouldVisitDirectory: function (entry) {
        const discovery = this.getDiscoveryConfiguration();
        if (discovery.ignoreDotDirectories !== false && entry.name.startsWith('.')) {
            return false;
        }
        return !this.getIgnoredDirectories().has(entry.name);
    },

    /**
     * Compares dotted Nodics module indexes numerically.
     * @param {string} left Left index.
     * @param {string} right Right index.
     * @returns {number} Sort comparison value.
     */
    compareModuleIndex: function (left, right) {
        const leftParts = String(left || '0').split('.').map(Number);
        const rightParts = String(right || '0').split('.').map(Number);
        const length = Math.max(leftParts.length, rightParts.length);
        for (let index = 0; index < length; index++) {
            const difference = (leftParts[index] || 0) - (rightParts[index] || 0);
            if (difference !== 0) {
                return difference;
            }
        }
        return 0;
    },

    /**
     * Checks whether a directory follows the Nodics module shape.
     * @param {string} directory Candidate directory.
     * @returns {boolean} Whether package and lifecycle metadata exist.
     */
    isModuleDirectory: function (directory) {
        return fs.existsSync(path.join(directory, 'package.json')) &&
            fs.existsSync(path.join(directory, 'nodics.js'));
    },

    /**
     * Recursively discovers module-shaped packages without loading the application runtime.
     * @param {string} directory Project directory to scan.
     * @param {Object[]} modules Mutable discovered-module collection.
     * @returns {Object[]} Discovered packages.
     */
    collectModules: function (directory, modules = []) {
        if (!fs.existsSync(directory)) {
            return modules;
        }
        if (this.isModuleDirectory(directory)) {
            const packageJson = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
            modules.push({
                name: packageJson.name || path.basename(directory),
                index: packageJson.index || '0',
                path: directory,
                packageJson: packageJson
            });
        }
        fs.readdirSync(directory, { withFileTypes: true })
            .filter(entry => entry.isDirectory() && this.shouldVisitDirectory(entry))
            .forEach(entry => this.collectModules(path.join(directory, entry.name), modules));
        return modules;
    },

    /**
     * Recursively finds service files with the requested filename below a module `src/service` directory.
     * @param {string} directory Directory to inspect.
     * @param {string} serviceFileName Service filename.
     * @param {string[]} files Mutable file list.
     * @returns {string[]} Matching service files.
     */
    collectServiceFiles: function (directory, serviceFileName, files = []) {
        if (!fs.existsSync(directory)) {
            return files;
        }
        fs.readdirSync(directory, { withFileTypes: true })
            .sort((left, right) => left.name.localeCompare(right.name))
            .forEach(entry => {
                const entryPath = path.join(directory, entry.name);
                if (entry.isDirectory()) {
                    this.collectServiceFiles(entryPath, serviceFileName, files);
                    return;
                }
                if (entry.name === serviceFileName) {
                    files.push(entryPath);
                }
            });
        return files;
    },

    /**
     * Loads and merges a tooling service by standard Nodics service filename.
     * @param {string} home Target project home.
     * @param {string} serviceName Service name without `.js`.
     * @returns {Object} Merged service implementation.
     */
    loadMergedService: function (home, serviceName) {
        const targetHome = path.resolve(home);
        const modules = this.collectModules(frameworkHome, []);
        if (targetHome !== frameworkHome) {
            this.collectModules(targetHome, modules);
        }
        const uniqueModules = Array.from(new Map(modules.map(moduleObject => [path.resolve(moduleObject.path), moduleObject])).values());
        uniqueModules.sort((left, right) => this.compareModuleIndex(left.index, right.index) || left.path.localeCompare(right.path));
        const serviceFileName = serviceName + '.js';
        return uniqueModules.reduce((service, moduleObject) => {
            const serviceFiles = this.collectServiceFiles(path.join(moduleObject.path, 'src', 'service'), serviceFileName, []);
            serviceFiles.forEach(serviceFile => {
                delete require.cache[require.resolve(serviceFile)];
                service = _.merge(service, require(serviceFile));
            });
            return service;
        }, {});
    },

    /**
     * Returns the configured property contribution file for a module.
     * @param {Object} moduleObject Discovered module.
     * @returns {string|null} Absolute contribution path when present.
     */
    getContributionPath: function (moduleObject) {
        const nodics = moduleObject.packageJson.nodics || {};
        const entrypoints = nodics.entrypoints || {};
        const relativePath = entrypoints.properties || 'config/properties.js';
        const contributionPath = path.resolve(moduleObject.path, relativePath);
        return fs.existsSync(contributionPath) ? contributionPath : null;
    },

    /**
     * Finds a JavaScript object literal assigned to a named object property without executing the whole file.
     * @param {string} source Source text.
     * @param {string} propertyName Property name to locate.
     * @param {number} startIndex Search start index.
     * @returns {string|null} Object literal source or null.
     */
    findObjectLiteralByProperty: function (source, propertyName, startIndex = 0) {
        const propertyPattern = new RegExp('(?:^|[,{])\\s*' + propertyName + '\\s*:', 'g');
        propertyPattern.lastIndex = startIndex;
        const match = propertyPattern.exec(source);
        if (!match) {
            return null;
        }
        const objectStart = source.indexOf('{', propertyPattern.lastIndex);
        if (objectStart < 0) {
            return null;
        }
        return this.readBalancedObjectLiteral(source, objectStart);
    },

    /**
     * Reads a balanced object literal while respecting JavaScript strings and comments.
     * @param {string} source Source text.
     * @param {number} objectStart Index of the opening brace.
     * @returns {string|null} Balanced object literal source or null.
     */
    readBalancedObjectLiteral: function (source, objectStart) {
        let depth = 0;
        let quote = null;
        let escaped = false;
        let lineComment = false;
        let blockComment = false;
        for (let index = objectStart; index < source.length; index++) {
            const current = source[index];
            const next = source[index + 1];
            if (lineComment) {
                lineComment = current !== '\n';
                continue;
            }
            if (blockComment) {
                if (current === '*' && next === '/') {
                    blockComment = false;
                    index++;
                }
                continue;
            }
            if (quote) {
                if (escaped) {
                    escaped = false;
                    continue;
                }
                escaped = current === '\\';
                if (current === quote && !escaped) {
                    quote = null;
                }
                continue;
            }
            if (current === '/' && next === '/') {
                lineComment = true;
                index++;
                continue;
            }
            if (current === '/' && next === '*') {
                blockComment = true;
                index++;
                continue;
            }
            if (current === '\'' || current === '"' || current === '`') {
                quote = current;
                continue;
            }
            if (current === '{') {
                depth++;
            } else if (current === '}') {
                depth--;
                if (depth === 0) {
                    return source.slice(objectStart, index + 1);
                }
            }
        }
        return null;
    },

    /**
     * Loads static tooling command declarations from `config/properties.js` without evaluating runtime properties.
     * @param {string} contributionPath Property contribution path.
     * @returns {Object<string,Object>} Tooling command declarations.
     */
    loadToolingCommands: function (contributionPath) {
        const source = fs.readFileSync(contributionPath, 'utf8');
        const toolingObject = this.findObjectLiteralByProperty(source, 'tooling', 0);
        if (!toolingObject) {
            return {};
        }
        const commandsObject = this.findObjectLiteralByProperty(toolingObject, 'commands', 0);
        if (!commandsObject) {
            return {};
        }
        try {
            return Function('return (' + commandsObject + ');')();
        } catch (error) {
            throw new Error('Unable to parse tooling.commands from ' + contributionPath + ': ' + error.message);
        }
    },

    /**
     * Merges one command contribution with explicit handler-replacement governance.
     * @param {Object<string,Object>} registry Mutable command registry.
     * @param {string} commandName Command identifier.
     * @param {Object} incoming Incoming command definition.
     * @param {Object} moduleObject Contributing module.
     * @returns {void}
     */
    mergeCommand: function (registry, commandName, incoming, moduleObject) {
        const existing = registry[commandName];
        const override = incoming.$override || {};
        const definition = Object.assign({}, incoming);
        delete definition.$override;
        if (existing && definition.handler && existing.handler !== definition.handler && override.mode !== 'replace') {
            throw new Error('Tooling command `' + commandName + '` changes its handler in module `' +
                moduleObject.name + '` without $override.mode="replace"');
        }
        if (override.mode && !['merge', 'replace'].includes(override.mode)) {
            throw new Error('Invalid tooling override mode for `' + commandName + '`: ' + override.mode);
        }
        const trace = existing && existing.xNodics && existing.xNodics.overrideTrace ?
            existing.xNodics.overrideTrace.slice() : [];
        trace.push({
            module: moduleObject.name,
            index: moduleObject.index,
            action: existing ? (override.mode || 'merge') : 'add'
        });
        registry[commandName] = Object.assign(
            {},
            existing && override.mode !== 'replace' ? existing : {},
            definition,
            {
                sourceModule: moduleObject.name,
                sourcePath: moduleObject.path,
                xNodics: { overrideTrace: trace }
            }
        );
    },

    /**
     * Builds the effective tooling command registry in module-index order.
     * @param {string} home Target project home.
     * @returns {Object<string,Object>} Effective command definitions.
     */
    loadCommands: function (home) {
        const targetHome = path.resolve(home);
        const modules = this.collectModules(frameworkHome, []);
        if (targetHome !== frameworkHome) {
            this.collectModules(targetHome, modules);
        }
        const uniqueModules = Array.from(new Map(modules.map(moduleObject => [path.resolve(moduleObject.path), moduleObject])).values());
        uniqueModules.sort((left, right) => this.compareModuleIndex(left.index, right.index) || left.path.localeCompare(right.path));
        const registry = {};
        uniqueModules.forEach(moduleObject => {
            const contributionPath = this.getContributionPath(moduleObject);
            if (!contributionPath) {
                return;
            }
            const commands = this.loadToolingCommands(contributionPath);
            Object.keys(commands).forEach(commandName => {
                this.mergeCommand(registry, commandName, commands[commandName], moduleObject);
            });
        });
        return registry;
    },

    /**
     * Prints available commands and their effective owners.
     * @param {Object<string,Object>} registry Effective registry.
     * @returns {void}
     */
    printHelp: function (registry) {
        console.log('Nodics tooling commands');
        Object.keys(registry).sort().forEach(commandName => {
            const command = registry[commandName];
            console.log('  ' + commandName + ' - ' + (command.description || '') + ' [' + command.sourceModule + ']');
        });
    },

    /**
     * Returns the built-in handler aliases owned by nTooling.
     * @returns {Object<string,string>} Handler alias map.
     */
    getBuiltInHandlers: function () {
        return {
            '@nTooling/node-script': path.join(toolingModulePath, 'src', 'service', 'command', 'defaultNodeScriptCommandService.js'),
            '@nTooling/mcp-governance': path.join(toolingModulePath, 'src', 'service', 'command', 'defaultMcpGovernanceCommandService.js'),
            '@nTooling/mcp-validate': path.join(toolingModulePath, 'src', 'service', 'command', 'defaultMcpValidationCommandService.js'),
            '@nTooling/mcp-runtime-context': path.join(toolingModulePath, 'src', 'service', 'command', 'defaultMcpRuntimeContextCommandService.js'),
            '@nTooling/mcp-mutation-plan': path.join(toolingModulePath, 'src', 'service', 'command', 'defaultMcpMutationPlanCommandService.js')
        };
    },

    /**
     * Resolves the handler path for a command.
     * @param {string} commandName Command name.
     * @param {Object} command Command definition.
     * @returns {string} Absolute handler path.
     */
    resolveHandlerPath: function (commandName, command) {
        const builtInHandlers = this.getBuiltInHandlers();
        const handlerPath = builtInHandlers[command.handler] || path.resolve(command.sourcePath, command.handler);
        if (!builtInHandlers[command.handler]) {
            const relativeHandlerPath = path.relative(command.sourcePath, handlerPath);
            if (relativeHandlerPath.startsWith('..') || path.isAbsolute(relativeHandlerPath)) {
                throw new Error('Tooling handler must remain inside its owning module: ' + commandName);
            }
        }
        return handlerPath;
    },

    /**
     * Executes a tooling command against the selected Nodics project.
     * @param {string[]} args CLI arguments beginning with a command name.
     * @returns {Promise<*>} Command result.
     */
    run: async function (args) {
        const home = this.resolveHome(args);
        const registry = this.loadCommands(home);
        const commandName = (args || []).find(arg => !arg.startsWith('-'));
        if (!commandName || ['help', '--help', '-h'].includes(commandName)) {
            this.printHelp(registry);
            return true;
        }
        const command = registry[commandName];
        if (!command) {
            throw new Error('Unknown Nodics tooling command: ' + commandName);
        }
        const handlerPath = this.resolveHandlerPath(commandName, command);
        const handler = require(handlerPath);
        if (!handler || typeof handler.run !== 'function') {
            throw new Error('Tooling handler does not export run(context): ' + handlerPath);
        }
        const commandArgs = args.filter(arg => arg !== commandName && !arg.startsWith('--home='));
        return handler.run({
            args: commandArgs,
            command: command,
            frameworkHome: frameworkHome,
            home: home,
            registry: registry
        });
    }
};
