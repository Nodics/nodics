/**
 * @module nDynamo/config/tooling
 * @description Contributes runtime configuration governance reporting to the non-runtime Nodics tooling registry.
 * @layer config
 * @owner nDynamo
 * @override Later project modules may explicitly replace the report command while preserving effective-state and override traceability.
 */
module.exports = {
    commands: {
        'governance:report': {
            description: 'Generate effective runtime configuration governance and override reports.',
            handler: '@nTooling/node-script',
            script: 'src/tooling/generateGovernanceReport.js'
        }
    }
};
