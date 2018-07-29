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
            rule: {
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
            rule: {
                enterpriseCode: 'enterpriseCode'
            },
            macros: {
                tenant: {
                    rule: {
                        name: '?0',
                        active: '?1'
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
            rule: {
                loginId: 'loginId'
            }
        },
        defaultCustomer: {
            options: {
                modelName: 'customer',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultCutomerData'
            },
            rule: {
                loginId: 'loginId'
            }
        },
        defaultPassword: {
            options: {
                modelName: 'password',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultPasswordData'
            },
            rule: {
                loginId: 'loginId'
            },
            macros: {
                personId: {
                    models: [{
                        model: 'employee',
                        returnProperty: '_id'
                    }, {
                        model: 'customer',
                        returnProperty: '_id'
                    }],
                    rule: {
                        loginId: '?0'
                    }
                }
            }
        }
    }
};