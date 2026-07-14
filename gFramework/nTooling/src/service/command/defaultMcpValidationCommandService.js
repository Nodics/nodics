/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/service/command/defaultMcpValidationCommandService
 * @description Runs approved Nodics validation checks for MCP clients and prints structured JSON results.
 * @layer tooling
 * @owner nTooling
 * @override Transport-specific MCP adapters may call the validation service directly, but command execution must remain allowlisted.
 */
const toolingCommandService = require('../defaultToolingCommandService');

module.exports = {
    /**
     * Reads repeated `--check=name` options.
     * @param {string[]} args CLI arguments.
     * @returns {string[]} Requested checks.
     */
    readChecks: function (args) {
        return (args || [])
            .filter(arg => arg.indexOf('--check=') === 0)
            .map(arg => arg.slice('--check='.length));
    },

    /**
     * Resolves the MCP validation behavior service from command configuration.
     * @param {Object} context Tooling command context.
     * @returns {Object} Validation service.
     */
    resolveService: function (context) {
        return toolingCommandService.loadMergedService(context.home, context.command.service || 'defaultMcpValidationService');
    },

    /**
     * Executes approved validation checks.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves after printing results.
     */
    run: async function (context) {
        const service = this.resolveService(context);
        const report = service.runValidation({
            home: context.home,
            checks: this.readChecks(context.args)
        });
        console.log(JSON.stringify(report, null, 2));
        if (report.summary.failed > 0) {
            throw new Error('MCP validation checks failed: ' + report.summary.failed);
        }
        return true;
    }
};
