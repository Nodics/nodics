/**
 * @module kickoff/kickoffEnvs/kickoffLocal/data/init/data/enterprise/kickoffLocalTestTenantsData
 * @description Provides kickoffEnvs initializer or sample data consumed by the import layer.
 * @layer data
 * @owner kickoffEnvs
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    record0: {
        code: 'nodicsTest',
        active: true,
        description: 'Dedicated local tenant for Nodics live destructive test execution'
    }
};
