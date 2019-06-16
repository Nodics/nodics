/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        defaultEnterprise: {
            options: {
                enabled: true,
                schemaName: 'enterprise',
                operation: 'save', //save, update and saveOrUpdate
                tenants: ['default'],
                dataFilePrefix: 'defaultEnterpriseData'
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
                            index: 0,
                        },
                        active: {
                            type: 'bool',
                            index: 1
                        }
                    }
                },
                addresses: {
                    options: {
                        model: 'address',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0
                        }
                    }
                },
                contacts: {
                    options: {
                        model: 'contact',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0
                        }
                    }
                }
            }
        }
    }
};