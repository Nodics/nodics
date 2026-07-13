/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

const frameworkHome = path.resolve(__dirname, '../../../..');
const toolingModulePath = path.resolve(__dirname, '../..');
const ignoredDirectories = new Set([
    '.git',
    '.idea',
    '.vscode',
    'node_modules',
    'logs',
    'temp',
    'tmp',
    'dist',
    'generated',
    'docs'
]);

/**
 * @module nTooling/service/defaultToolingCommandService
 * @description Discovers non-runtime tooling command contributions from module-shaped packages, orders them by Nodics module index, applies explicit handler override governance, and executes commands against a selected project home.
 * @layer tooling
 * @owner nTooling
 * @override Projects extend commands through `config/tooling.js`; changing an existing handler requires `$override.mode: 'replace'` so customization remains intentional and traceable.
 */

/**
 * Reads a `--name=value` command-line option.
 * @param {string[]} args Command arguments.
 * @param {string} name Option name.
 * @param {*} defaultValue Fallback value.
 * @returns {*} Parsed value or the fallback.
 */
function readOption(args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
}

/**
 * Resolves the consuming Nodics project rather than assuming the framework source is the project root.
 * @param {string[]} args Command arguments.
 * @returns {string} Absolute project home.
 */
function resolveHome(args) {
    const configuredHome = readOption(args, '--home', process.env.NODICS_HOME || '');
    return configuredHome ? path.resolve(configuredHome) : process.cwd();
}

/**
 * Compares dotted Nodics module indexes numerically.
 * @param {string} left Left index.
 * @param {string} right Right index.
 * @returns {number} Sort comparison value.
 */
function compareModuleIndex(left, right) {
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
}

/**
 * Checks whether a directory follows the Nodics module shape.
 * @param {string} directory Candidate directory.
 * @returns {boolean} Whether package and lifecycle metadata exist.
 */
function isModuleDirectory(directory) {
    return fs.existsSync(path.join(directory, 'package.json')) &&
        fs.existsSync(path.join(directory, 'nodics.js'));
}

/**
 * Recursively discovers module-shaped packages without loading the application runtime.
 * @param {string} directory Project directory to scan.
 * @param {Object[]} modules Mutable discovered-module collection.
 * @returns {Object[]} Discovered packages.
 */
function collectModules(directory, modules = []) {
    if (!fs.existsSync(directory)) {
        return modules;
    }
    if (isModuleDirectory(directory)) {
        const packageJson = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
        modules.push({
            name: packageJson.name || path.basename(directory),
            index: packageJson.index || '0',
            path: directory,
            packageJson: packageJson
        });
    }
    fs.readdirSync(directory, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && !ignoredDirectories.has(entry.name))
        .forEach(entry => collectModules(path.join(directory, entry.name), modules));
    return modules;
}

/**
 * Returns the configured tooling contribution file for a module.
 * @param {Object} moduleObject Discovered module.
 * @returns {string|null} Absolute contribution path when present.
 */
function getContributionPath(moduleObject) {
    const nodics = moduleObject.packageJson.nodics || {};
    const tooling = nodics.tooling || {};
    const relativePath = tooling.commands || 'config/tooling.js';
    const contributionPath = path.resolve(moduleObject.path, relativePath);
    return fs.existsSync(contributionPath) ? contributionPath : null;
}

/**
 * Merges one command contribution with explicit handler-replacement governance.
 * @param {Object<string,Object>} registry Mutable command registry.
 * @param {string} commandName Command identifier.
 * @param {Object} incoming Incoming command definition.
 * @param {Object} moduleObject Contributing module.
 * @returns {void}
 */
function mergeCommand(registry, commandName, incoming, moduleObject) {
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
}

/**
 * Builds the effective tooling command registry in module-index order.
 * @param {string} home Target project home.
 * @returns {Object<string,Object>} Effective command definitions.
 */
function loadCommands(home) {
    const targetHome = path.resolve(home);
    const modules = collectModules(frameworkHome, []);
    if (targetHome !== frameworkHome) {
        collectModules(targetHome, modules);
    }
    const uniqueModules = Array.from(new Map(modules.map(moduleObject => [path.resolve(moduleObject.path), moduleObject])).values());
    uniqueModules.sort((left, right) => compareModuleIndex(left.index, right.index) || left.path.localeCompare(right.path));
    const registry = {};
    uniqueModules.forEach(moduleObject => {
        const contributionPath = getContributionPath(moduleObject);
        if (!contributionPath) {
            return;
        }
        delete require.cache[require.resolve(contributionPath)];
        const contribution = require(contributionPath) || {};
        Object.keys(contribution.commands || {}).forEach(commandName => {
            mergeCommand(registry, commandName, contribution.commands[commandName], moduleObject);
        });
    });
    return registry;
}

/**
 * Prints available commands and their effective owners.
 * @param {Object<string,Object>} registry Effective registry.
 * @returns {void}
 */
function printHelp(registry) {
    console.log('Nodics tooling commands');
    Object.keys(registry).sort().forEach(commandName => {
        const command = registry[commandName];
        console.log('  ' + commandName + ' - ' + (command.description || '') + ' [' + command.sourceModule + ']');
    });
}

/**
 * Executes a tooling command against the selected Nodics project.
 * @param {string[]} args CLI arguments beginning with a command name.
 * @returns {Promise<*>} Command result.
 */
async function run(args) {
    const home = resolveHome(args);
    const registry = loadCommands(home);
    const commandName = (args || []).find(arg => !arg.startsWith('-'));
    if (!commandName || ['help', '--help', '-h'].includes(commandName)) {
        printHelp(registry);
        return true;
    }
    const command = registry[commandName];
    if (!command) {
        throw new Error('Unknown Nodics tooling command: ' + commandName);
    }
    const builtInHandlers = {
        '@nTooling/node-script': path.join(toolingModulePath, 'src', 'command', 'nodeScriptCommand.js')
    };
    const handlerPath = builtInHandlers[command.handler] || path.resolve(command.sourcePath, command.handler);
    if (!builtInHandlers[command.handler]) {
        const relativeHandlerPath = path.relative(command.sourcePath, handlerPath);
        if (relativeHandlerPath.startsWith('..') || path.isAbsolute(relativeHandlerPath)) {
            throw new Error('Tooling handler must remain inside its owning module: ' + commandName);
        }
    }
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

module.exports = {
    collectModules,
    compareModuleIndex,
    loadCommands,
    mergeCommand,
    resolveHome,
    run
};
