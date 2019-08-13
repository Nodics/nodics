module.exports = {
    defaultEnterprise:
    {
        header:
        {
            options:
            {
                schemaName: 'enterprise',
                operation: 'save',
                tenants: ['default'],
                dataFilePrefix: 'defaultEnterpriseData',
                moduleName: 'profile',
                fileName: 'enterpriseInitDataHeader_js',
                filePath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/headers/enterpriseInitDataHeader_processing.js',
                done: false
            },
            query: { code: '$code' },
            macros:
            {
                tenant:
                {
                    options: { model: 'tenant', returnProperty: 'code' },
                    rule:
                    {
                        code: { type: 'string', index: 0 },
                        active: { type: 'bool', index: 1 }
                    }
                },
                addresses:
                {
                    options: { model: 'address', returnProperty: 'code' },
                    rule: { code: { type: 'string', index: 0 } }
                },
                contacts:
                {
                    options: { model: 'contact', returnProperty: 'code' },
                    rule: { code: { type: 'string', index: 0 } }
                }
            }
        },
        dataFiles:
        {
            defaultEnterpriseData_js:
            {
                type: 'js',
                list:
                    ['/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/data/defaultEnterpriseData_processing.js'],
                processedRecords: []
            }
        }
    }
};


defaultTenant:
{
    header:
    {
        options:
        {
            modelName: 'tenant';
            operation: 'saveOrUpdate';
            tenant: 'default';
            dataFilePrefix: 'defaultTenantData';
            dataFile: 'defaultTenantData'
        };
        rule: {
            name: 'name'
        }
    };
    dataFiles: {
        defaultTenantData: {
            type: 'js';
            list: [
                '/Users/himkar.dwivedi/apps/HimProjects/nodics/core/profile/data/init/data/defaultTenantData.js',
                '/Users/himkar.dwivedi/apps/HimProjects/nodics/kickoff/local/sampleServer/data/init/defaultTenantData.js'
            ]
        }
    }
}

defaultEnterprise:
{
    header:
    {
        options:
        {
            modelName: 'enterprise';
            operation: 'saveOrUpdate';
            tenant: 'default';
            dataFilePrefix: 'defaultEnterpriseData';
            dataFile: 'defaultEnterpriseData'
        };
        rule: {
            enterpriseCode: 'enterpriseCode'
        };
        macros: {
            tenant: [Object]
        }
    };
    dataFiles: {
        defaultEnterpriseData: {
            type: 'js';
            list: ['/Users/himkar.dwivedi/apps/HimProjects/nodics/core/profile/data/init/data/defaultEnterpriseData.js']
        }
    }
}

defaultEmployee:
{
    header:
    {
        options:
        {
            modelName: 'employee';
            operation: 'saveOrUpdate';
            tenant: 'default';
            dataFilePrefix: 'defaultEmployeeData';
            dataFile: 'defaultEmployeeData'
        };
        rule: {
            loginId: 'loginId'
        }
    };
    dataFiles: {
        defaultEmployeeData: {
            type: 'js';
            list: ['/Users/himkar.dwivedi/apps/HimProjects/nodics/core/profile/data/init/data/defaultEmployeeData.js']
        }
    }
}

defaultCustomer:
{
    header:
    {
        options:
        {
            modelName: 'customer';
            operation: 'saveOrUpdate';
            tenant: 'default';
            dataFilePrefix: 'defaultCutomerData';
            dataFile: 'defaultCutomerData'
        };
        rule: {
            loginId: 'loginId'
        }
    };
    dataFiles: {
        defaultCutomerData: {
            type: 'js';
            list: ['/Users/himkar.dwivedi/apps/HimProjects/nodics/core/profile/data/init/data/defaultCutomerData.js']
        }
    }
}

defaultPassword: {
    header: {
        options: {
            modelName: 'password';
            operation: 'saveOrUpdate';
            tenant: 'default';
            dataFilePrefix: 'defaultPasswordData'
        };
        rule: {
            loginId: 'loginId'
        };
        macros: {
            personId: [Object]
        }
    };
    dataFiles: {
        defaultPasswordData: {
            type: 'js';
            list: ['/Users/himkar.dwivedi/apps/HimProjects/nodics/core/profile/data/init/data/defaultPasswordData.js']
        }
    }
}
