/**
 * @module kickoff/kickoffEnvs/kickoffLocal/data/init/headers/enterprise/kickoffLocalTestTenantsHeader
 * @description Provides kickoffEnvs initializer or sample data consumed by the import layer.
 * @layer data
 * @owner kickoffEnvs
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        kickoffLocalTestTenants: {
            options: {
                enabled: true,
                schemaName: 'tenant',
                operation: 'saveAll',
                tenants: ['default'],
                dataFilePrefix: 'kickoffLocalTestTenantsData',
                owningModule: 'kickoffLocal'
            },
            query: {
                code: '$code'
            }
        }
    }
};
