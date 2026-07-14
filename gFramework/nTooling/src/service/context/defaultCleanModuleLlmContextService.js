/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
