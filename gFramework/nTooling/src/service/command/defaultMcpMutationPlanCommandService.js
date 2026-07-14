/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/service/command/defaultMcpMutationPlanCommandService
 * @description Prints guarded mutation and generation plans for MCP clients without executing writes by default.
 * @layer tooling
 * @owner nTooling
 * @override Future executors may consume these plans only with explicit approval and the same guardrails.
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
     * Reads repeated `--input=key:value` options.
     * @param {string[]} args CLI arguments.
     * @returns {Object} Parsed input map.
     */
    readInputs: function (args) {
        return (args || [])
            .filter(arg => arg.indexOf('--input=') === 0)
            .map(arg => arg.slice('--input='.length))
            .reduce((inputs, pair) => {
                const separatorIndex = pair.indexOf(':');
                if (separatorIndex < 0) {
                    return inputs;
                }
                inputs[pair.slice(0, separatorIndex)] = pair.slice(separatorIndex + 1);
                return inputs;
            }, {});
    },

    /**
     * Resolves the MCP mutation guard behavior service from command configuration.
     * @param {Object} context Tooling command context.
     * @returns {Object} Mutation guard service.
     */
    resolveService: function (context) {
        return toolingCommandService.loadMergedService(context.home, context.command.service || 'defaultMcpMutationGuardService');
    },

    /**
     * Executes mutation planning without applying writes.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves after printing the plan.
     */
    run: async function (context) {
        const service = this.resolveService(context);
        const plan = service.createPlan({
            home: context.home,
            action: this.readOption(context.args, '--action', 'module-skeleton'),
            target: this.readOption(context.args, '--target', '.'),
            inputs: this.readInputs(context.args)
        });
        console.log(JSON.stringify(plan, null, 2));
        return true;
    }
};
