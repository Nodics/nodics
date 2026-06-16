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
