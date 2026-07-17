/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const { spawnSync } = require('child_process');

/**
 * @module nTooling/service/command/DefaultReleaseCheckCommandService
 * @description Runs or prints the clean-checkout release gate from governed
 * tooling configuration so dependency installation, generation, documentation,
 * LLM context, and tests remain wired to a single release command.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may replace or extend the release gate
 * through `tooling.commands.release:check` while preserving dry-run and execute
 * behavior.
 */
module.exports = {
    /**
     * Checks whether a command argument is present.
     *
     * @param {Object} context Tooling command context.
     * @param {string} flag CLI flag.
     * @returns {boolean} True when the flag is present.
     */
    hasFlag: function (context, flag) {
        return (context.args || []).indexOf(flag) >= 0;
    },

    /**
     * Creates the effective release gate plan.
     *
     * @param {Object} context Tooling command context.
     * @returns {Object[]} Ordered release gate steps.
     */
    createPlan: function (context) {
        const command = context.command || {};
        const steps = [].concat(command.steps || []);
        if (this.hasFlag(context, '--full')) {
            return steps.concat(command.fullSteps || []);
        }
        return steps;
    },

    /**
     * Converts a configured release step into an executable command tuple.
     *
     * @param {Object} step Release gate step.
     * @returns {Object} Normalized command.
     */
    normalizeStep: function (step) {
        if (step.npm) {
            return {
                command: 'npm',
                args: [].concat(step.npm),
                label: 'npm ' + [].concat(step.npm).join(' ')
            };
        }
        if (step.npmRun) {
            return {
                command: 'npm',
                args: ['run'].concat(step.npmRun),
                label: 'npm run ' + [].concat(step.npmRun).join(' ')
            };
        }
        throw new Error('Invalid release check step: ' + JSON.stringify(step));
    },

    /**
     * Prints the effective release gate without executing it.
     *
     * @param {Object[]} plan Release gate plan.
     * @returns {void}
     */
    printPlan: function (plan) {
        console.log('Nodics clean-checkout release gate');
        plan.forEach((step, index) => {
            const normalized = this.normalizeStep(step);
            console.log('  ' + (index + 1) + '. ' + normalized.label);
        });
        console.log('Run with --execute to execute this gate. Add --full to include full release validation.');
    },

    /**
     * Executes one release gate step.
     *
     * @param {Object} context Tooling command context.
     * @param {Object} step Release gate step.
     * @returns {void}
     */
    executeStep: function (context, step) {
        const normalized = this.normalizeStep(step);
        const result = spawnSync(normalized.command, normalized.args, {
            cwd: context.home,
            env: Object.assign({}, process.env, { NODICS_HOME: context.home }),
            stdio: 'inherit'
        });
        if (result.error) {
            throw result.error;
        }
        if (result.status !== 0) {
            throw new Error('Release check failed with exit code ' + result.status + ': ' + normalized.label);
        }
    },

    /**
     * Runs the release check command.
     *
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves after printing or executing the gate.
     */
    run: async function (context) {
        const plan = this.createPlan(context);
        if (!this.hasFlag(context, '--execute')) {
            this.printPlan(plan);
            return true;
        }
        plan.forEach(step => this.executeStep(context, step));
        return true;
    }
};
