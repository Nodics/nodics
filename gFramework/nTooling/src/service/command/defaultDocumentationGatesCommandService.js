/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const documentationGates = require('../quality/defaultDocumentationGatesQualityService');

/**
 * @module nTooling/service/command/defaultDocumentationGatesCommandService
 * @description Tooling command adapter for governed project documentation gates.
 * @layer tooling
 * @owner nTooling
 * @override A later project tooling contribution may replace this handler explicitly.
 */
module.exports = {
    /**
     * Executes documentation gates against the selected project home.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves after all gates run.
     */
    run: async function (context) {
        documentationGates.run(['--home=' + context.home].concat(context.args));
        return true;
    }
};
