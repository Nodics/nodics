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
                //addresses.code: '$code'
                code: '$code',
                /*jobDetail.name: '$name'
                name: 'Himkar Dwivedi'*/
            }
        },

        defaultAddress: {
            options: {
                modelName: 'address',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultAddressData'
            },
            query: {
                code: '$code'
            }
        },

        tenantDefaultAddresses: {
            options: {
                modelName: 'address',
                operation: 'save', //save, update and saveOrUpdate
                //tenant: 'default',
                dataFilePrefix: 'tenantDefaultAddressesData'
            },
            query: {
                code: '$code'
            }
        },

        defaultContact: {
            options: {
                modelName: 'contact',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultContactData'
            },
            query: {
                code: '$code'
            }
        },

        tenantDefaultContact: {
            options: {
                modelName: 'contact',
                operation: 'save', //save, update and saveOrUpdate
                //tenant: 'default',
                dataFilePrefix: 'tenantDefaultContactData'
            },
            query: {
                code: '$code'
            }
        },

        defaultUserGroup: {
            options: {
                modelName: 'userGroup',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultUserGroupData'
            },
            query: {
                code: '$code'
            }
        },

        tenantDefaultUserGroup: {
            options: {
                modelName: 'userGroup',
                operation: 'save', //save, update and saveOrUpdate
                //tenant: 'default',
                dataFilePrefix: 'tenantDefaultUserGroupData'
            },
            query: {
                code: '$code'
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
        },

        defaultEmployee: {
            options: {
                modelName: 'employee',
                operation: 'save', //save, update and saveOrUpdate
                //tenant: 'default',
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
                modelName: 'customer',
                operation: 'save', //save, update and saveOrUpdate
                //tenant: 'default',
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