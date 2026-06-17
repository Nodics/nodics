const path = require('path');

const {
    removeDirectory,
    scanModules
} = require('./module-llm-context-utils');

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
