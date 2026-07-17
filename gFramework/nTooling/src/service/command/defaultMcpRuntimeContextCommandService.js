/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/service/command/defaultMcpRuntimeContextCommandService
 * @description Prints source-backed runtime hierarchy and override-path context for MCP clients.
 * @layer tooling
 * @owner nTooling
 * @override Runtime-aware transport adapters may wrap this command, but effective runtime mutation must stay outside this explanatory surface.
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
     * Resolves the MCP runtime-context behavior service from command configuration.
     * @param {Object} context Tooling command context.
     * @returns {Object} Runtime context service.
     */
    resolveService: function (context) {
        return toolingCommandService.loadMergedService(context.home, context.command.service || 'defaultMcpRuntimeContextService');
    },

    /**
     * Executes the runtime context report command.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves after printing the report.
     */
    run: async function (context) {
        const service = this.resolveService(context);
        const report = service.createRuntimeContext({
            home: context.home,
            server: this.readOption(context.args, '--server', ''),
            path: this.readOption(context.args, '--path', '.')
        });
        console.log(JSON.stringify(report, null, 2));
        return true;
    }
};
