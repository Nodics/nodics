const documentationCoverage = require('../quality/checkDocumentationCoverage');

/**
 * @module nTooling/command/documentationCoverageCommand
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
