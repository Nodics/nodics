/**
 * @module kickoff/kickoffEnvs/kickoffLocal/data/init/headers/enterprise/kickoffLocalTestEnterpriseHeader
 * @description Provides kickoffEnvs initializer or sample data consumed by the import layer.
 * @layer data
 * @owner kickoffEnvs
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
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
