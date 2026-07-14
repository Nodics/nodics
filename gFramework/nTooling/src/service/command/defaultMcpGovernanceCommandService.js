/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/service/command/defaultMcpGovernanceCommandService
 * @description Prints the read-only Nodics governance payload that future MCP adapters can expose without owning source-of-truth behavior.
 * @layer tooling
 * @owner nTooling
 * @override Projects may explicitly replace this command handler for a transport adapter, but any replacement must preserve read-only source-of-truth boundaries.
 */
const toolingCommandService = require('../defaultToolingCommandService');

module.exports = {
    /**
     * Reads a command-line option in `--name=value` form.
     * @param {string[]} args CLI arguments.
     * @param {string} name Option name.
     * @param {*} defaultValue Default value.
     * @returns {*} Parsed value or default.
     */
    readOption: function (args, name, defaultValue) {
        const prefix = name + '=';
        const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
        return match ? match.slice(prefix.length) : defaultValue;
    },

    /**
     * Reads all repeated `--change=path` options.
     * @param {string[]} args CLI arguments.
     * @returns {string[]} Requested change-impact paths.
     */
    readChangePaths: function (args) {
        return (args || [])
            .filter(arg => arg.indexOf('--change=') === 0)
            .map(arg => arg.slice('--change='.length));
    },

    /**
     * Resolves the MCP governance behavior service from command configuration.
     * @param {Object} context Tooling command context.
     * @returns {Object} Governance service.
     */
    resolveService: function (context) {
        return toolingCommandService.loadMergedService(context.home, context.command.service || 'defaultMcpGovernanceService');
    },

    /**
     * Executes the read-only governance report command.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves after printing the report.
     */
    run: async function (context) {
        const service = this.resolveService(context);
        const report = service.createReport({
            home: context.home,
            path: this.readOption(context.args, '--path', '.'),
            changePaths: this.readChangePaths(context.args)
        });
        console.log(JSON.stringify(report, null, 2));
        return true;
    }
};
