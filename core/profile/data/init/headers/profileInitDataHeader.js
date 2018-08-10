/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        defaultTenant: {
            options: {
                modelName: 'tenant',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultTenantData'
            },
            query: {
                name: 'name'
            }
        },
        defaultEnterprise: {
            options: {
                modelName: 'enterprise',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultEnterpriseData'
            },
            query: {
                enterpriseCode: 'enterpriseCode'
            },
            macros: {
                tenant: {
                    options: {
                        model: 'tenant',
                        returnProperty: '_id'
                    },
                    rule: {
                        name: {
                            type: 'String',
                            index: 0,
                        },
                        active: {
                            type: 'boolean',
                            index: 1
                        }
                    }
                }
            }
        },
        defaultEmployee: {
            options: {
                modelName: 'employee',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultEmployeeData'
            },
            query: {
                loginId: 'loginId',
                enterpriseCode: 'enterpriseCode'
            }
        },
        defaultCustomer: {
            options: {
                modelName: 'customer',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultCutomerData'
            },
            query: {
                loginId: 'loginId',
                enterpriseCode: 'enterpriseCode'
            }
        },
        defaultPassword: {
            options: {
                modelName: 'password',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultPasswordData'
            },
            query: {
                loginId: 'loginId',
                enterpriseCode: 'enterpriseCode'
            }
        }
    }
};