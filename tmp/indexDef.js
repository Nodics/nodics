module.exports = {
    enabled: false,
    idPropertyName: 'code',
    indexName: 'enterprise',
    typeName: 'enterprise',
    moduleName: 'profile',
    schemaName: 'enterprise',
    properties: {
        enterpriseCode: {
            enabled: true,
            name: 'enterpriseCode',
            weight: 0,
            sequence: 0,
            type: 'text',
            index: 'not_analyzed'
        },
        active: {
            enabled: true,
            name: 'active',
            type: 'text',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0
        },
        description: {
            enabled: false,
            name: 'description',
            type: 'text',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0,
            handler: 'DefaultEnterpriseIndexHandlerService.getEnterpriseDescription'
        },
        created: {
            enabled: true,
            name: 'created',
            type: 'text',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0
        },
        updated: {
            enabled: true,
            name: 'updated',
            type: 'text',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0
        },
        code: {
            enabled: true,
            name: 'code',
            type: 'text',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0
        },
        name: {
            enabled: true,
            type: 'text',
            name: 'name',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0
        },
        tenant: {
            enabled: true,
            type: 'text',
            name: 'tenant',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0,
            properties: [Object]
        },
        superEnterprise: {
            enabled: true,
            type: 'text',
            name: 'superEnterprise',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0
        },
        addresses: {
            enabled: true,
            type: 'text',
            name: 'addresses',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0
        },
        contacts: {
            enabled: true,
            type: 'text',
            name: 'contacts',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0
        },
        custom: {
            enabled: true,
            handler: 'DefaultEnterpriseIndexHandlerService.getEnterpriseCustom',
            name: 'custom',
            type: 'text',
            index: 'not_analyzed',
            weight: 0,
            sequence: 0
        }
    }
};