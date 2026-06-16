module.exports = {
    profile: {
        kickoffLocalTestEnterprise: {
            options: {
                enabled: true,
                schemaName: 'enterprise',
                operation: 'saveAll',
                tenants: ['default'],
                dataFilePrefix: 'kickoffLocalTestEnterpriseData',
                owningModule: 'kickoffLocal'
            },
            query: {
                code: '$code'
            },
            macros: {
                tenant: {
                    options: {
                        model: 'tenant',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0
                        },
                        active: {
                            type: 'bool',
                            index: 1
                        }
                    }
                }
            }
        }
    }
};
