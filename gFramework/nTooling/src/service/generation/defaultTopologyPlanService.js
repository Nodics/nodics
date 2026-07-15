/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');
const structureGeneratorService = require('./defaultStructureGeneratorService');

/**
 * @module nTooling/service/generation/defaultTopologyPlanService
 * @description Creates approval-first Nodics project topology plans and optionally applies them through the structure generator.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may replace or wrap topology planning while preserving no-write-by-default behavior and structure-audit compatibility.
 */

function readOption(args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
}

function readCsv(args, name, defaultValue) {
    const value = readOption(args, name, '');
    if (!value) {
        return defaultValue || [];
    }
    return value.split(',').map(item => item.trim()).filter(Boolean);
}

function ensureArray(value, fallback) {
    return value && value.length > 0 ? value : fallback;
}

function toPosix(filePath) {
    return filePath.split(path.sep).join('/');
}

function upperCaseFirstChar(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function serverProperties(moduleName, activeGroups, activeModules) {
    return `/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module ${moduleName}/config/properties
 * @description Defines generated server topology configuration, active module selection, and process-owned defaults for ${moduleName}.
 * @layer config
 * @owner generated
 * @override Environment, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    activeModules: {
        groups: ${JSON.stringify(activeGroups, null, 8).replace(/\n/g, '\n        ')},
        modules: ${JSON.stringify(activeModules, null, 8).replace(/\n/g, '\n        ')}
    }
};
`;
}

module.exports = {
    /**
     * Parses topology planning arguments.
     * @param {string[]} args Command arguments.
     * @returns {Object} Topology options.
     */
    createOptions: function (args) {
        const name = readOption(args, '--name', '');
        const targetPath = readOption(args, '--path', name);
        const modules = ensureArray(readCsv(args, '--modules', []), [name + 'Core']);
        return {
            apply: (args || []).includes('--apply'),
            name: name,
            groupName: readOption(args, '--groupName', ''),
            targetPath: targetPath ? path.resolve(process.cwd(), targetPath) : '',
            baseIndex: readOption(args, '--index', '9000'),
            modules: modules,
            providers: readCsv(args, '--providers', []),
            envs: ensureArray(readCsv(args, '--envs', []), ['local']),
            servers: ensureArray(readCsv(args, '--servers', []), [name + 'Server']),
            nodes: readCsv(args, '--nodes', ['node0']),
            activeGroups: readCsv(args, '--activeGroups', ['gCore', 'gFramework', 'modules'])
        };
    },

    /**
     * Validates topology planning options.
     * @param {Object} options Topology options.
     * @returns {boolean} True when options are valid.
     */
    validateOptions: function (options) {
        if (!options.name || !/^[A-Za-z][A-Za-z0-9]*$/.test(options.name)) {
            throw new Error('A valid --name=<ProjectName> is required.');
        }
        if (!options.groupName) {
            throw new Error('Topology planning requires --groupName=<companyOrProjectGroup>.');
        }
        if (!options.targetPath) {
            throw new Error('Topology planning requires --path=<projectPath>.');
        }
        return true;
    },

    /**
     * Creates a deterministic topology plan without writing files.
     * @param {Object} options Topology options.
     * @returns {Object} Topology plan.
     */
    createPlan: function (options) {
        this.validateOptions(options);
        const base = options.baseIndex;
        const entries = [];
        entries.push({
            kind: 'project',
            name: options.name,
            path: options.targetPath,
            index: base + '.0',
            groupName: options.groupName
        });
        options.modules.forEach((moduleName, index) => {
            entries.push({
                kind: 'capability',
                name: moduleName,
                path: path.join(options.targetPath, 'modules', moduleName),
                index: base + '.1' + (index + 1)
            });
        });
        options.providers.forEach((providerName, index) => {
            entries.push({
                kind: 'provider',
                name: providerName,
                path: path.join(options.targetPath, 'modules', providerName),
                index: base + '.2' + (index + 1)
            });
        });
        options.envs.forEach((envName, envIndex) => {
            const envPath = path.join(options.targetPath, 'envs', envName);
            entries.push({
                kind: 'environment',
                name: envName,
                path: envPath,
                index: base + '.3' + (envIndex + 1)
            });
            options.servers.forEach((serverName, serverIndex) => {
                const scopedServerName = options.envs.length > 1 ? envName + upperCaseFirstChar(serverName) : serverName;
                const serverPath = path.join(envPath, scopedServerName);
                entries.push({
                    kind: 'server',
                    name: scopedServerName,
                    path: serverPath,
                    index: base + '.3' + (envIndex + 1) + '.' + (serverIndex + 1),
                    activeGroups: options.activeGroups,
                    activeModules: [scopedServerName, envName].concat(options.modules, options.providers)
                });
                options.nodes.forEach((nodeName, nodeIndex) => {
                    entries.push({
                        kind: 'node',
                        name: nodeName,
                        path: path.join(serverPath, nodeName),
                        index: base + '.3' + (envIndex + 1) + '.' + (serverIndex + 1) + (nodeIndex + 1)
                    });
                });
            });
        });
        return {
            project: options.name,
            groupName: options.groupName,
            apply: options.apply,
            entries: entries,
            validations: [
                'npm run structure:audit -- --fail',
                'npm run llm:generate',
                'npm run llm:validate'
            ]
        };
    },

    /**
     * Applies a topology plan through the structure generator.
     * @param {Object} plan Topology plan.
     * @returns {Object} Applied plan summary.
     */
    applyPlan: function (plan) {
        plan.entries.forEach(entry => {
            const args = [
                '--kind=' + entry.kind,
                '--name=' + entry.name,
                '--path=' + entry.path,
                '--index=' + entry.index
            ];
            if (entry.kind === 'project') {
                args.push('--groupName=' + entry.groupName);
            }
            structureGeneratorService.generate(structureGeneratorService.createOptions(args));
            if (entry.kind === 'server') {
                fs.writeFileSync(path.join(entry.path, 'config', 'properties.js'),
                    serverProperties(entry.name, entry.activeGroups, entry.activeModules), 'utf8');
            }
        });
        return plan;
    },

    /**
     * Prints a topology plan for developer approval.
     * @param {Object} plan Topology plan.
     * @returns {void}
     */
    printPlan: function (plan) {
        console.log('Nodics topology plan');
        console.log('Project        : ' + plan.project);
        console.log('Group name     : ' + plan.groupName);
        console.log('Mode           : ' + (plan.apply ? 'apply' : 'plan-only'));
        console.log('\nHierarchy:');
        plan.entries.forEach(entry => {
            console.log('  - [' + entry.kind + '] ' + entry.name + ' @ ' + toPosix(entry.path) + ' #' + entry.index);
            if (entry.kind === 'server') {
                console.log('    activeModules.groups  : ' + entry.activeGroups.join(', '));
                console.log('    activeModules.modules : ' + entry.activeModules.join(', '));
            }
        });
        console.log('\nValidation commands:');
        plan.validations.forEach(command => console.log('  - ' + command));
        if (!plan.apply) {
            console.log('\nNo files written. Re-run with --apply after approval.');
        }
    },

    /**
     * Runs topology planning from command-line arguments.
     * @param {string[]} args Command arguments.
     * @returns {void}
     */
    runCli: function (args) {
        const options = this.createOptions(args || []);
        const plan = this.createPlan(options);
        if (options.apply) {
            this.applyPlan(plan);
        }
        this.printPlan(plan);
    }
};

if (require.main === module) {
    module.exports.runCli(process.argv.slice(2));
}
