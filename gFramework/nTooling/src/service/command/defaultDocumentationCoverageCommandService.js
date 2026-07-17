/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
