/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const path = require('path');
const { spawnSync } = require('child_process');

/**
 * @module nTooling/service/command/defaultNodicsLifecycleCommandService
 * @description Runs root Nodics lifecycle commands through governed tooling so package.json exposes a small command façade while build and clean gates stay source-controlled.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may replace lifecycle command definitions through standard tooling command override governance.
 */
module.exports = {
    /**
     * Spawns a child command inside the selected Nodics project home.
     *
     * @param {Object} context Tooling command context.
     * @param {string} command Executable name.
     * @param {string[]} args Executable arguments.
     * @returns {void}
     */
    spawn: function (context, command, args) {
        const result = spawnSync(command, args, {
            cwd: context.home,
            env: Object.assign({}, process.env, { NODICS_HOME: context.home }),
            stdio: 'inherit'
        });
        if (result.error) {
            throw result.error;
        }
        if (result.status !== 0) {
            throw new Error('Nodics lifecycle command failed with exit code ' + result.status + ': ' + command + ' ' + args.join(' '));
        }
    },

    /**
     * Executes a Nodics runtime function in an isolated process.
     *
     * @param {Object} context Tooling command context.
     * @param {string} method Runtime method name.
     * @returns {void}
     */
    runNodicsMethod: function (context, method) {
        this.spawn(context, process.execPath, ['-e',
            'Promise.resolve(require("./nodics").' + method + '()).catch(error => { console.error(error); process.exit(1); })'
        ]);
    },

    /**
     * Executes another governed Nodics tooling command.
     *
     * @param {Object} context Tooling command context.
     * @param {string[]} args Tool command arguments.
     * @returns {void}
     */
    runTool: function (context, args) {
        const toolPath = path.join(context.frameworkHome, 'gFramework', 'nTooling', 'bin', 'nodics-tool.js');
        this.spawn(context, process.execPath, [toolPath].concat(args));
    },

    /**
     * Runs a configured lifecycle step.
     *
     * @param {Object} context Tooling command context.
     * @param {Object} step Lifecycle step.
     * @returns {void}
     */
    runStep: function (context, step) {
        if (step.tool) {
            this.runTool(context, step.tool);
            return;
        }
        if (step.nodicsMethod) {
            this.runNodicsMethod(context, step.nodicsMethod);
            return;
        }
        throw new Error('Invalid Nodics lifecycle step: ' + JSON.stringify(step));
    },

    /**
     * Runs the lifecycle command declared in nTooling properties.
     *
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves when the lifecycle command passes.
     */
    run: async function (context) {
        const steps = context.command.steps || [];
        steps.forEach(step => this.runStep(context, step));
        return true;
    }
};
