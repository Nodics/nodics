const path = require('path');
const { spawnSync } = require('child_process');

/**
 * @module nTooling/command/nodeScriptCommand
 * @description Executes a trusted Node.js tooling script owned by the effective command-contributing module while preserving the selected project home.
 * @layer tooling
 * @owner nTooling
 * @override Projects may explicitly replace a command with their own in-module handler or script.
 */
module.exports = {
    /**
     * Executes the configured script in an isolated child process.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves when the script exits successfully.
     */
    run: async function (context) {
        const scriptPath = path.resolve(context.command.sourcePath, context.command.script);
        const relativeScriptPath = path.relative(context.command.sourcePath, scriptPath);
        if (relativeScriptPath.startsWith('..') || path.isAbsolute(relativeScriptPath)) {
            throw new Error('Tooling script must remain inside its owning module: ' + context.command.script);
        }
        const result = spawnSync(process.execPath, [scriptPath].concat(context.command.arguments || [], context.args), {
            cwd: context.home,
            env: Object.assign({}, process.env, { NODICS_HOME: context.home }),
            stdio: 'inherit'
        });
        if (result.error) {
            throw result.error;
        }
        if (result.status !== 0) {
            throw new Error('Tooling script failed with exit code ' + result.status + ': ' + context.command.script);
        }
        return true;
    }
};
