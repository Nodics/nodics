/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const path = require('path');
const { spawnSync } = require('child_process');
const defaultProperties = require('../../../config/properties');

/**
 * @module nTooling/service/command/defaultTestSuiteCommandService
 * @description Runs named Nodics test suites from tooling-owned suite configuration so root package scripts stay small while test composition remains source-controlled and overrideable.
 * @layer tooling
 * @owner nTooling
 * @override Project tooling modules may replace this command handler or add suite definitions through the governed tooling command/configuration path.
 */
module.exports = {
    /**
     * Reads a `--name=value` command option.
     *
     * @param {string[]} args Command arguments.
     * @param {string} name Option name.
     * @returns {string|undefined} Option value.
     */
    readOption: function (args, name) {
        const prefix = name + '=';
        const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
        return match ? match.slice(prefix.length) : undefined;
    },

    /**
     * Resolves the requested suite from CLI arguments.
     *
     * @param {string[]} args Command arguments.
     * @returns {string} Suite name.
     */
    resolveSuiteName: function (args) {
        return this.readOption(args, '--suite') || (args || []).find(arg => !arg.startsWith('-'));
    },

    /**
     * Returns configured test suite definitions.
     *
     * @returns {Object<string,Object[]>} Suite definitions.
     */
    getSuites: function () {
        return defaultProperties.tooling.testSuites || {};
    },

    /**
     * Spawns a command and fails when it exits unsuccessfully.
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
            throw new Error('Test suite command failed with exit code ' + result.status + ': ' + command + ' ' + args.join(' '));
        }
    },

    /**
     * Executes one suite step.
     *
     * @param {Object} context Tooling command context.
     * @param {Object<string,Object[]>} suites Suite registry.
     * @param {Object} step Suite step.
     * @param {string[]} stack Active suite recursion stack.
     * @returns {void}
     */
    runStep: function (context, suites, step, stack) {
        if (step.suite) {
            this.runSuite(context, suites, step.suite, stack);
        } else if (step.npm) {
            this.spawn(context, 'npm', ['run', step.npm].concat(step.args || []));
        } else if (step.node) {
            this.spawn(context, process.execPath, [path.resolve(context.home, step.node)].concat(step.args || []));
        } else if (step.tool) {
            const toolPath = path.join(context.frameworkHome, 'gFramework', 'nTooling', 'bin', 'nodics-tool.js');
            this.spawn(context, process.execPath, [toolPath].concat(step.tool, step.args || []));
        } else {
            throw new Error('Invalid test suite step: ' + JSON.stringify(step));
        }
    },

    /**
     * Runs a named suite and nested suites.
     *
     * @param {Object} context Tooling command context.
     * @param {Object<string,Object[]>} suites Suite registry.
     * @param {string} suiteName Suite name.
     * @param {string[]} stack Active suite recursion stack.
     * @returns {void}
     */
    runSuite: function (context, suites, suiteName, stack) {
        if (!suites[suiteName]) {
            throw new Error('Unknown Nodics test suite: ' + suiteName);
        }
        if (stack.includes(suiteName)) {
            throw new Error('Circular Nodics test suite reference: ' + stack.concat(suiteName).join(' -> '));
        }
        console.log('\nNodics test suite: ' + suiteName);
        suites[suiteName].forEach(step => this.runStep(context, suites, step, stack.concat(suiteName)));
    },

    /**
     * Runs the requested configured test suite.
     *
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves when the suite passes.
     */
    run: async function (context) {
        const suiteName = this.resolveSuiteName(context.args);
        if (!suiteName) {
            console.log('Available Nodics test suites: ' + Object.keys(this.getSuites()).sort().join(', '));
            return true;
        }
        this.runSuite(context, this.getSuites(), suiteName, []);
        return true;
    }
};
