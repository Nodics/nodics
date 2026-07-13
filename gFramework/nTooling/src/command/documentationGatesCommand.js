/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const documentationGates = require('../quality/runDocumentationGates');

/**
 * @module nTooling/command/documentationGatesCommand
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
