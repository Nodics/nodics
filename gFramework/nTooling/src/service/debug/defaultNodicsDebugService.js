/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const { spawn } = require('child_process');

/**
 * @module nTooling/service/debug/defaultNodicsDebugService
 * @description Launches Nodics start, build, or clean lifecycle methods under the Node inspector while preserving project arguments and exit status.
 * @layer tooling
 * @owner nTooling
 * @override Projects may explicitly replace registered debug commands without modifying this launcher.
 */

const commands = {
    start: 'start',
    build: 'buildAll',
    clean: 'cleanAll'
};

module.exports = {
    /**
     * Prints debugger command usage.
     * @returns {void}
     */
    printUsage: function () {
        console.error('Usage: npm run <start|build|clean>:debug -- [--port=9229] [--no-brk] [SERVER=serverName] [NODE=nodeName]');
    },

    /**
     * Parses debug launcher command-line arguments.
     * @param {string[]} argv Process argument array.
     * @returns {Object} Parsed debug options.
     */
    parseArgs: function (argv) {
        let command = argv[2];
        let port = process.env.NODICS_DEBUG_PORT || '9229';
        let breakOnStart = process.env.NODICS_DEBUG_BREAK !== 'false';
        let passthrough = [];

        argv.slice(3).forEach((arg, index, args) => {
            if (arg === '--no-brk') {
                breakOnStart = false;
            } else if (arg === '--brk') {
                breakOnStart = true;
            } else if (arg.startsWith('--port=')) {
                port = arg.replace('--port=', '');
            } else if (arg === '--port') {
                port = args[index + 1] || port;
            } else if (args[index - 1] !== '--port') {
                passthrough.push(arg);
            }
        });

        return {
            command,
            port,
            breakOnStart,
            passthrough
        };
    },

    /**
     * Launches the selected Nodics lifecycle command under Node inspector.
     * @param {string[]} argv Process argument array.
     * @returns {void}
     */
    runCli: function (argv) {
        let options = this.parseArgs(argv);
        let nodicsMethod = commands[options.command];

        if (!nodicsMethod) {
            this.printUsage();
            process.exit(1);
        }

        let inspectFlag = '--inspect' + (options.breakOnStart ? '-brk' : '') + '=' + options.port;
        let child = spawn(process.execPath, [
            inspectFlag,
            '-e',
            'require("./nodics").' + nodicsMethod + '()'
        ].concat(options.passthrough), {
            cwd: process.cwd(),
            stdio: 'inherit'
        });

        child.on('exit', code => {
            process.exit(code || 0);
        });

        child.on('error', error => {
            console.error(error);
            process.exit(1);
        });
    }
};

if (require.main === module) {
    module.exports.runCli(process.argv);
}
