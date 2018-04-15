/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

let mongoose = require('mongoose');

module.exports = {
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

        tenant: {
            super: 'none',
            model: true,
            service: true,
            event: false,
            cache: {
                enabled: true,
                ttl: 100
            },
            router: true,
            definition: {
                created: {
                    type: 'Date',
                    default: new Date() //new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
                },
                updated: {
                    type: 'Date',
                    default: new Date() //new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
                },
                name: {
                    type: 'String',
                    required: true,
                    unique: true
                },
                active: {
                    type: 'Boolean',
                    default: true
                },
                properties: {
                    type: mongoose.Schema.Types.Mixed,
                    required: true
                }
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
                    modelName: "TenantModel",
                    type: 'one'
                },
                superEnterprise: {
                    modelName: "EnterpriseModel",
                    type: 'one'
                },
                subEnterprises: {
                    modelName: "EnterpriseModel",
                    type: 'many'
                }
            },
            definition: {
                enterpriseCode: {
                    unique: true
                },
                name: {
                    type: 'String',
                    required: true
                },
                description: {
                    type: 'String'
                },

                addresses: ["schemas['address']"],
                contacts: ["schemas['contact']"],

                tenant: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'TenantModel',
                    required: true
                },

                superEnterprise: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'EnterpriseModel'
                },

                subEnterprises: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'EnterpriseModel'
                }]
            }
        },

        password: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            router: true,
            definition: {
                password: {
                    type: "String",
                    required: true
                },
                loginId: {
                    type: "String",
                    required: true,
                    unique: true,
                    index: true
                },
                personId: {
                    type: 'String',
                    required: true
                }
            }
        },

        active: {
            super: 'none',
            model: true,
            service: false,
            event: false,
            router: false,
            definition: {
                loginId: {
                    type: "String",
                    required: true,
                    unique: true,
                    index: true
                },
                personId: {
                    type: 'String',
                    required: true
                },
                attempts: {
                    type: 'Number',
                    default: 1,
                    validate: {
                        validator: NODICS.getValidators().checkValidForAttempts,
                        message: '{VALUE} is not a valid attempt! put 1 instead'
                    }
                },
                lastAttempt: {
                    type: 'Date'
                },
                locked: {
                    type: 'Boolean',
                    default: false
                },
                lockedTime: {
                    type: 'Date'
                },
                active: {
                    type: 'Boolean',
                    default: true
                },
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
                loginId: {
                    type: "String",
                    required: true,
                    unique: true,
                    index: true
                },
                autoUnloack: {
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
            cache: {
                enabled: true,
                ttl: 100
            },
            definition: {
                // ...
            },
            options: {
                strict: true
            }

        },

        customer: {
            super: 'person',
            model: true,
            service: true,
            event: true,
            router: true,
            cache: {
                enabled: true,
                ttl: 20
            },
            definition: {
                // ...
            }
        }
    }
};