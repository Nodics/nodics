/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module common/service/infra/DefaultInfraService
 * @description Infrastructure service boundary for Nodics application and module
 * generation. The legacy nCommon template-copy generator is intentionally retired
 * until custom project scaffolding is reintroduced through explicit tooling
 * contracts and LLM/developer guidance.
 * @layer service
 * @owner nCommon
 * @override Project modules may override this service to customize application
 * factory generation, naming rules, or generated project structure.
 */
module.exports = {

    /**
     * Initializes the common infrastructure service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the common infrastructure service.
     *
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Rejects use of retired template-copy generation with replacement guidance.
     *
     * @param {string} commandName Generator command that was requested.
     * @returns {Promise<boolean>} Never resolves successfully because legacy templates are removed.
     * @sideEffects Logs replacement guidance and terminates CLI execution with exit code 1.
     */
    rejectRetiredTemplateGenerator: function (commandName) {
        return new Promise((resolve, reject) => {
            const message = [
                'Nodics legacy template generation is retired.',
                'Command: ' + commandName + '.',
                'The old nCommon/templates scaffold folder has been removed so custom project modules,',
                'environment modules, server modules, and node modules can be generated later from',
                'explicit Nodics contracts instead of copied placeholder folders.',
                'Track the replacement through the LLM/developer module-generation backlog before',
                're-enabling this command.'
            ].join(' ');
            this.LOG.error(message);
            process.exit(1);
        });
    },

    /**
     * Rejects the retired full application generator.
     *
     * @returns {Promise<boolean>} Never resolves successfully because legacy templates are removed.
     */
    generateApp: function () {
        return this.rejectRetiredTemplateGenerator('generate:app');
    },

    /**
     * Rejects the retired application bootstrap generator.
     *
     * @param {Object} command Parsed legacy command details.
     * @returns {Promise<boolean>} Never resolves successfully because legacy templates are removed.
     */
    initAppGen: function (command) {
        return this.rejectRetiredTemplateGenerator('generate:app');
    },

    /**
     * Rejects the retired module-group generator.
     *
     * @returns {Promise<boolean>} Never resolves successfully because legacy templates are removed.
     */
    generateModuleGroup: function () {
        return this.rejectRetiredTemplateGenerator('generate:group');
    },

    /**
     * Rejects the retired backend module generator.
     *
     * @returns {Promise<boolean>} Never resolves successfully because legacy templates are removed.
     */
    generateModule: function () {
        return this.rejectRetiredTemplateGenerator('generate:module');
    },

    /**
     * Rejects the retired React module generator.
     *
     * @returns {Promise<boolean>} Never resolves successfully because legacy templates are removed.
     */
    generateReactModule: function () {
        return this.rejectRetiredTemplateGenerator('generate:module:react');
    },

    /**
     * Rejects the retired Vue module generator.
     *
     * @returns {Promise<boolean>} Never resolves successfully because legacy templates are removed.
     */
    generateVueModule: function () {
        return this.rejectRetiredTemplateGenerator('generate:module:vue');
    },

    /**
     * Prints retired generator help to stdout.
     *
     * @returns {void}
     */
    moduleGenHelp: function () {
        console.log('');
        console.log('');
        console.log('------------------------------------------------------------------------------------------');
        console.log('Legacy template generation is retired until contract-driven project scaffolding is implemented.');
        console.log('');
        console.log('==> Disabled commands: app, group, module, module:react, module:vue');
        console.log('{');
        console.log(' - Replacement: generate custom project structures from explicit Nodics contracts,');
        console.log('   metadata, active-module registration, layered configuration, tests, and docs.');
        console.log(' - Backlog: LLM/developer guidance will define custom project module, environment,');
        console.log('   server, and node generation before these commands are re-enabled.');
        console.log('}');
        console.log('------------------------------------------------------------------------------------------');
        console.log('');

    },

    /**
     * Parses retired module generation CLI arguments for compatibility with old callers.
     *
     * @returns {Object} Parsed command with name, path, index, and no template path.
     * @sideEffects Exits process when required arguments are missing.
     */
    parseCommand: function () {
        let name, path, index;
        process.argv.forEach(element => {
            if (element.startsWith('N=')) {
                name = element.replace('N=', '');
            }
            if (element.startsWith('NAME=')) {
                name = element.replace('NAME=', '');
            }
            if (element.startsWith('D=')) {
                path = element.replace('D=', '');
            }
            if (element.startsWith('DEST=')) {
                path = element.replace('DEST=', '');
            }
            if (element.startsWith('IDX=')) {
                index = element.replace('IDX=', '');
            }
        });
        if (!name || name === '') {
            this.LOG.error('Name can not be null or empty');
            this.moduleGenHelp();
            process.exit(1);
        }
        if (name === 'app' && !index) {
            this.LOG.error('Index can not be null or empty');
            this.moduleGenHelp();
            process.exit(1);
        }
        this.LOG.debug('Retired generation command parsed for folder: ' + name + ', at: ' + path);
        let moduleObject = NODICS.getIndexedModules().get(path);
        if (!moduleObject) {
            this.LOG.warn('Could not found module by given index, So generating at root level');
            moduleObject = NODICS.getRawModule('nodics');
        }
        return {
            name: name,
            path: moduleObject.path,
            index: index,
            commonPath: undefined
        };
    },

    /**
     * Rejects direct template-copy generation because legacy template folders are removed.
     *
     * @param {Object} command Parsed legacy command.
     * @param {string} templateName Template folder name requested by an old caller.
     * @returns {void}
     * @sideEffects Logs an error and exits process with code 1.
     */
    generateTarget: function (command, templateName) {
        this.LOG.error('Legacy template folder `' + templateName + '` is retired; generation must use the future contract-driven scaffolding flow.');
        process.exit(1);
    }
};
