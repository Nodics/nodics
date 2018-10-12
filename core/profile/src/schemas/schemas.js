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
            service: true,
            event: false,
            cache: {
                enabled: true,
                ttl: 100
            },
            router: true,
            definition: {
                enterpriseCode: {
                    required: false
                },
                active: {
                    type: 'bool',
                    required: true,
                    description: 'Flag to check if tenant is still active'
                },
                properties: {
                    type: 'object',
                    required: false,
                    description: 'JSON formate of properties defined for this tenant'
                }
            }
        },

        address: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            router: true,
            cache: {
                enabled: true,
                ttl: 1000
            },
            definition: {
                enterpriseCode: {
                    required: false
                },
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
                active: {
                    type: 'bool',
                    required: true,
                    default: true,
                    description: 'Flag to check if current address is active'
                },
            }
        },

        contact: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            router: true,
            definition: {
                enterpriseCode: {
                    required: false
                },
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
                active: {
                    type: 'bool',
                    required: true,
                    default: false,
                    description: 'Flag to check if current contact is active'
                },
            }
        },

        enterprise: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            cache: {
                enabled: true,
                ttl: 100
            },
            router: true,
            refSchema: {
                tenant: {
                    schemaName: "tenant",
                    type: 'one',
                    propertyName: 'code'
                },
                superEnterprise: {
                    schemaName: "enterprise",
                    type: 'one',
                    propertyName: 'code'
                },
                subEnterprises: {
                    schemaName: "enterprise",
                    type: 'many',
                    propertyName: 'code'
                },
                addresses: {
                    schemaName: "address",
                    type: 'many',
                    propertyName: 'code'
                },
                contacts: {
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
                    description: 'Name of enterprise'
                },
                tenant: {
                    type: 'string',
                    required: true,
                    description: 'Required Code of associated tenant'
                },
                superEnterprise: {
                    type: 'objectId',
                    required: false,
                    description: 'Parent enterprise code if any'
                },
                subEnterprises: {
                    type: 'array',
                    required: false,
                    description: 'List of sub enterprises if any'
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
            }
        },

        userState: {
            super: 'super',
            model: true,
            service: true,
            event: false,
            router: false,
            definition: {
                enterpriseCode: {
                    required: false
                },
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
            service: true,
            event: true,
            router: true,
            definition: {
                name: {
                    type: 'string',
                    required: true,
                    description: 'Name of the user group'
                }
            },
            indexes: {
                indexName: {
                    name: 'name',
                    options: {
                        unique: true
                    }
                }
            }
        },

        user: {
            super: 'base',
            model: false,
            service: false,
            event: false,
            router: false,
            refSchema: {
                userGroups: {
                    schemaName: "userGroup",
                    type: 'many',
                    propertyName: 'code'
                },
                addresses: {
                    schemaName: "address",
                    type: 'many',
                    propertyName: 'code'
                },
                contacts: {
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
                active: {
                    type: 'bool',
                    required: true,
                    default: true,
                    description: 'Required flag to check if user in active currently'
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
                indexLoginId: {
                    name: 'loginId',
                    options: {
                        unique: true
                    }
                }
            }
        },

        employee: {
            super: 'user',
            model: true,
            service: true,
            event: true,
            router: true
        },

        customer: {
            super: 'user',
            model: true,
            service: true,
            event: true,
            router: true,
            cache: {
                enabled: true,
                ttl: 20
            }
        }
    }
};