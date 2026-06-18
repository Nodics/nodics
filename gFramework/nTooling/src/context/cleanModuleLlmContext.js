const path = require('path');

/**
 * @module nTooling/context/cleanModuleLlmContext
 * @description Removes generated module context from every discovered project module while preserving human-authored LLM guidance.
 * @layer tooling
 * @owner nTooling
 * @override Projects may replace the `llm:clean` command explicitly while preserving module ownership boundaries.
 */

const {
    removeDirectory,
    scanModules
} = require('./moduleLlmContextUtils');

function run() {
    let modules = scanModules();
    let contextModules = modules.filter(module => module.relativePath !== 'gSetup');
    contextModules.forEach(module => {
        removeDirectory(path.join(module.path, 'llm', 'generated'));
    });
    console.log('Cleaned generated module LLM context for ' + contextModules.length + ' modules');
}

if (require.main === module) {
    run();
}

module.exports = {
    run
};
