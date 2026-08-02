/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const documentationCoverage = require('../quality/defaultDocumentationCoverageQualityService');

/**
 * @module nTooling/service/command/defaultDocumentationCoverageCommandService
 * @description Tooling command adapter for project-scoped documentation coverage inspection.
 * @layer tooling
 * @owner nTooling
 * @override A later project tooling contribution may replace this handler explicitly.
 */
module.exports = {
    /**
     * Executes documentation coverage against the selected project home.
     * @param {Object} context Tooling command context.
     * @returns {Promise<boolean>} Resolves after the report is printed.
     */
    run: async function (context) {
        documentationCoverage.runCli(['--home=' + context.home].concat(context.args));
        return true;
    }
};
