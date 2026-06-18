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
