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
                    type: 'String'
                },
                contactNo: {
                    type: 'String'
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


        user: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            router: true,
            definition: {
                firstName: "String",
                lastName: "String",
                name: {
                    type: "String",
                    default: 'Nodics Framework'
                },
                addresses: ["schemas['address']"],
                contacts: ["schemas['contact']"],
            }
        },
        person: {
            super: 'user',
            model: true,
            service: true,
            router: true,
            definition: {
                displayName: "String"
            }
        }
    }
};