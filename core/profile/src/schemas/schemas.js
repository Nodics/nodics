/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

let mongoose = require('mongoose');

module.exports = {
    //Database name
    profile: {
        address: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            router: true,
            definition: {
                flatNo: {
                    type: 'String'
                },
                blockNo: {
                    type: 'String'
                },
                building: {
                    type: 'String'
                },
                locality: {
                    type: 'String'
                },
                city: {
                    type: 'String'
                },
                state: {
                    type: 'String'
                },
                zipCode: {
                    type: 'String'
                },
                contacts: ["schemas['contact']"]
            }
        },

        contact: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            router: true,
            definition: {
                contactType: {
                    type: 'String',
                    required: true
                },
                prefix: {
                    type: 'String'
                },
                contactNo: {
                    type: 'String',
                    required: true
                }
            }
        },

        enterprise: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            router: true,
            refSchema: {
                superEnterprise: {
                    modelName: "EnterpriceModel",
                    type: 'one'
                },
                subEnterprises: {
                    modelName: "EnterpriceModel",
                    type: 'many'
                }
            },

            definition: {
                name: {
                    type: 'String',
                    required: true
                },
                description: {
                    type: 'String'
                },
                tenant: {
                    type: 'String',
                    required: true
                },

                addresses: ["schemas['address']"],
                contacts: ["schemas['contact']"],

                superEnterprise: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'EnterpriceModel'
                },

                subEnterprises: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'EnterpriceModel'
                }]
            }
        },

        person: {
            super: 'base',
            model: false,
            service: false,
            event: false,
            router: false,
            definition: {
                firstName: {
                    type: "String",
                    required: true
                },
                middleName: {
                    type: "String"
                },
                lastName: {
                    type: "String",
                    required: true
                },
                lastLogin: {
                    type: 'Date'
                },
                loginId: {
                    type: "String",
                    required: true,
                    unique: true
                },
                password: {
                    type: "String",
                    required: true
                },
                locked: {
                    type: 'Boolean'
                },
                lockedTime: {
                    type: 'Date'
                },
                active: {
                    type: 'Boolean',
                    default: true
                },
                addresses: ["schemas['address']"],
                contacts: ["schemas['contact']"],
            }
        },

        employee: {
            super: 'person',
            model: true,
            service: true,
            event: true,
            router: true,
            definition: {

            }
        },

        customer: {
            super: 'person',
            model: true,
            service: true,
            event: true,
            router: true,
            definition: {

            }
        },
    }
};