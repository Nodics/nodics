/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        tenant: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 100
            },
            router: {
                enabled: true
            },
            tenants: ['default'],
            definition: {
                properties: {
                    type: 'object',
                    required: false,
                    description: 'JSON formate of properties defined for this tenant',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                }
            }
        },

        address: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 360
            },
            search: {
                enabled: false,
                idPropertyName: 'code', // if null, code will be taken
            },
            refSchema: {
                contacts: {
                    enabled: true,
                    schemaName: "contact",
                    type: 'many',
                    propertyName: 'code'
                }
            },
            definition: {
                flatNo: {
                    type: 'string',
                    required: false,
                    description: 'Flat number of the address'
                },
                building: {
                    type: 'string',
                    required: false,
                    description: 'Name of Building of the address'
                },
                street: {
                    type: 'string',
                    required: false,
                    description: 'Street name of the address'
                },
                addressLine1: {
                    type: 'string',
                    required: false,
                    description: 'Can be used for landmark or optional properties'
                },
                addressLine2: {
                    type: 'string',
                    required: false,
                    description: 'Can be used for landmark or optional properties'
                },
                locality: {
                    type: 'string',
                    required: false,
                    description: 'Locality of the address'
                },
                city: {
                    type: 'string',
                    required: true,
                    description: 'City of the address'
                },
                state: {
                    type: 'string',
                    required: true,
                    description: 'State of the address'
                },
                postalCode: {
                    type: 'string',
                    required: true,
                    description: 'PastalCode of the address'
                },
                contacts: {
                    type: 'array',
                    required: false,
                    description: 'All associated contacts with this enterprise'
                }
            }
        },

        contact: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            definition: {
                prefix: {
                    type: 'string',
                    required: false,
                    description: 'Add prefix if any like country code for mobile number'
                },
                type: {
                    enum: [ENUMS.ContactType.EMAIL.key, ENUMS.ContactType.PHONE.key, ENUMS.ContactType.FAX.key, ENUMS.ContactType.PAGER.key],
                    required: true,
                    description: 'Required value could be only in [EMAIL, PHONE, FAX, PAGER]'
                },
                value: {
                    type: 'string',
                    required: true,
                    description: 'Required value of respective type'
                },
                priority: {
                    type: 'int',
                    required: true,
                    default: 0
                },
            },
        },

        enterprise: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 360
            },
            router: {
                enabled: true
            },
            tenants: ['default'], // if not null, only tenant will be used
            search: {
                enabled: false,
                //indexName: 'enterprise', // if null, moduleName will be taken
                idPropertyName: 'code', // if null, code will be taken
            },
            refSchema: {
                tenant: {
                    enabled: true,
                    schemaName: "tenant",
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true

                },
                superEnterprise: {
                    enabled: true,
                    schemaName: "enterprise",
                    type: 'one',
                    propertyName: 'code'
                },
                subEnterprises: {
                    enabled: true,
                    schemaName: "enterprise",
                    type: 'many',
                    propertyName: 'code'
                },
                addresses: {
                    enabled: true,
                    schemaName: "address",
                    type: 'many',
                    propertyName: 'code'
                },
                contacts: {
                    enabled: true,
                    schemaName: "contact",
                    type: 'many',
                    propertyName: 'code'
                }
            },
            virtualProperties: {
                fullname: 'DefaultEnterpriseVirtualService.getFullName',
                tenant: {
                    fullname: 'DefaultEnterpriseVirtualService.getFullName'
                }
            },
            definition: {
                name: {
                    type: 'string',
                    required: true,
                    description: 'Name of enterprise',
                    searchOptions: {
                        enabled: true, // default is false
                        default: 'test',
                    }
                },
                tenant: {
                    type: 'string',
                    required: true,
                    description: 'Required Code of associated tenant',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                superEnterprise: {
                    type: 'objectId',
                    required: false,
                    description: 'Parent enterprise code if any',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                subEnterprises: {
                    type: 'array',
                    required: false,
                    description: 'List of sub enterprises if any'
                },
                addresses: {
                    type: 'array',
                    required: false,
                    description: 'All associated addresses with this enterprise',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                contacts: {
                    type: 'array',
                    required: false,
                    description: 'All associated contacts with this enterprise',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                }
            },
            indexes: {
                individual: {
                    entTenant: {
                        name: 'tenant',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    }
                }
            }
        },

        userState: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: false
            },
            definition: {
                personId: {
                    type: 'objectId',
                    required: true
                },
                loginId: {
                    type: 'string',
                    required: true,
                    description: 'Required unique login id'
                },
                locked: {
                    type: 'bool',
                    required: true,
                    default: false,
                    description: 'Flag to check if user is locked'
                },
                attempts: {
                    type: 'int',
                    required: true,
                    default: 0,
                    minimum: 0,
                    maximum: 5,
                    description: "must be an integer in [ 0, 5 ] and is required"
                }
            }

        },

        userGroup: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            refSchema: {
                parentGroups: {
                    enabled: true,
                    schemaName: "userGroup",
                    type: 'many',
                    propertyName: 'code'
                },
            },
            definition: {
                name: {
                    type: 'string',
                    required: true,
                    description: 'Name of the user group'
                },
                parentGroups: {
                    type: 'array',
                    required: false,
                    description: 'List of parent groups'
                },
            }
        },

        password: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: false
            },
            definition: {
                loginId: {
                    type: 'string',
                    required: true,
                    description: 'Required unique login id'
                },
                password: {
                    type: 'string',
                    required: true,
                    description: 'Required password for the login'
                }
            }

        },

        user: {
            super: 'base',
            model: false,
            service: {
                enabled: false
            },
            router: {
                enabled: false
            },
            refSchema: {
                password: {
                    enabled: true,
                    schemaName: "password",
                    type: 'one',
                    propertyName: '_id'
                },
                userGroups: {
                    enabled: true,
                    schemaName: "userGroup",
                    type: 'many',
                    propertyName: 'code'
                },
                addresses: {
                    enabled: true,
                    schemaName: "address",
                    type: 'many',
                    propertyName: 'code'
                },
                contacts: {
                    enabled: true,
                    schemaName: "contact",
                    type: 'many',
                    propertyName: 'code'
                }
            },
            definition: {
                name: {
                    type: 'object',
                    required: true
                },
                'name.title': {
                    type: 'string',
                    required: false,
                    description: 'Title for the user'
                },
                'name.firstName': {
                    type: 'string',
                    required: true,
                    description: 'First name for the user'
                },
                'name.middleName': {
                    type: 'string',
                    required: false,
                    description: 'Middle name for the user if any'
                },
                'name.lastName': {
                    type: 'string',
                    required: true,
                    description: 'Last name for the user'
                },
                loginId: {
                    type: 'string',
                    required: true,
                    description: 'Required unique login id'
                },
                password: {
                    type: 'string',
                    required: true,
                    description: 'Required password for the login'
                },
                userGroups: {
                    type: 'array',
                    required: true,
                    description: 'User group code for which this user belongs'
                },
                addresses: {
                    type: 'array',
                    required: false,
                    description: 'All associated addresses with this enterprise'
                },
                contacts: {
                    type: 'array',
                    required: false,
                    description: 'All associated contacts with this enterprise'
                }
            },

            indexes: {
                // composite: {
                //     indexName: {
                //         name: 'name',
                //         enabled: true,
                //         options: {
                //             unique: true
                //         }
                //     },
                //     indexName1: {
                //         name: 'name1',
                //         enabled: true,
                //         options: {
                //             unique: true
                //         }
                //     }
                // },
                individual: {
                    indexLoginId: {
                        name: 'loginId',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    }
                }
            }
        },

        employee: {
            super: 'user',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            definition: {
                apiKey: {
                    type: 'string',
                    required: true,
                    description: 'Required to authenticate all internal requests'
                }
            }
        },

        customer: {
            super: 'user',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 20
            }
        }
    }
};