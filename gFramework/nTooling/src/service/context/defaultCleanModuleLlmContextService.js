/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const path = require('path');

/**
 * @module nTooling/service/context/defaultCleanModuleLlmContextService
 * @description Removes generated module context from every discovered project module while preserving human-authored LLM guidance.
 * @layer tooling
 * @owner nTooling
 * @override Projects may replace the `llm:clean` command explicitly while preserving module ownership boundaries.
 */

const {
    removeDirectory,
    scanModules
} = require('./defaultModuleLlmContextUtilsService');

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
