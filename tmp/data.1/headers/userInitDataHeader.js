/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        defaultEmployee: {
            options: {
                schemaName: 'employee',
                operation: 'save', //save, update and saveOrUpdate
                dataFilePrefix: 'defaultEmployeeData'
            },
            query: {
                code: '$code',
                loginId: '$loginId',
                enterpriseCode: '$enterpriseCode'
            },
            macros: {
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
        },

        defaultCustomer: {
            options: {
                schemaName: 'customer',
                operation: 'save', //save, update and saveOrUpdate
                dataFilePrefix: 'defaultCutomerData'
            },
            query: {
                code: '$code',
                loginId: '$loginId',
                enterpriseCode: '$enterpriseCode'
            },
            macros: {
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