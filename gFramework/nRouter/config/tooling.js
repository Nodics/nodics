/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nRouter/config/tooling
 * @description Contributes OpenAPI contract generation to the non-runtime Nodics tooling registry.
 * @layer config
 * @owner nRouter
 * @override Later project modules may explicitly replace the command while layered router and schema contributions remain the preferred customization mechanism.
 */
module.exports = {
    commands: {
        'docs:openapi': {
            description: 'Generate OpenAPI from effective router and schema contracts.',
            handler: '@nTooling/node-script',
            script: 'src/tooling/generateOpenapiContract.js'
        }
    }
};
