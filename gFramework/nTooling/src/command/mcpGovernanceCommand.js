/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/command/mcpGovernanceCommand
 * @description Prints the read-only Nodics governance payload that future MCP adapters can expose without owning source-of-truth behavior.
 * @layer tooling
 * @owner nTooling
 * @override Projects may explicitly replace this command handler for a transport adapter, but any replacement must preserve read-only source-of-truth boundaries.
 */
const readOnlyGovernanceService = require('../mcp/readOnlyGovernanceService');

/**
 * Reads a command-line option in `--name=value` form.
 * @param {string[]} args CLI arguments.
 * @param {string} name Option name.
 * @param {*} defaultValue Default value.
 * @returns {*} Parsed value or default.
 */
function readOption(args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
}

/**
 * Reads all repeated `--change=path` options.
 * @param {string[]} args CLI arguments.
 * @returns {string[]} Requested change-impact paths.
 */
function readChangePaths(args) {
    return (args || [])
        .filter(arg => arg.indexOf('--change=') === 0)
        .map(arg => arg.slice('--change='.length));
}

module.exports = {
    /**
     * Executes the read-only governance report command.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves after printing the report.
     */
    run: async function (context) {
        const report = readOnlyGovernanceService.createReport({
            home: context.home,
            path: readOption(context.args, '--path', '.'),
            changePaths: readChangePaths(context.args)
        });
        console.log(JSON.stringify(report, null, 2));
        return true;
    }
};
