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
            router: true
        },

        contact: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            router: true
        },

        tenant: {
            super: 'super',
            model: true,
            service: true,
            event: false,
            cache: {
                enabled: true,
                ttl: 100
            },
            router: true
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
                    propertyName: '_id'
                },
                superEnterprise: {
                    schemaName: "enterprise",
                    type: 'one',
                    propertyName: '_id'
                },
                subEnterprises: {
                    schemaName: "enterprise",
                    type: 'many',
                    propertyName: '_id'
                }
            },
            virtualProperties: {
                fullname: 'DefaultEnterpriseVirtualService.getFullName',
                tenant: {
                    fullname: 'DefaultEnterpriseVirtualService.getFullName'
                }
            }
        },

        password: {
            super: 'base',
            model: true,
            service: true,
            event: true,
            router: true
        },

        active: {
            super: 'super',
            model: true,
            service: false,
            event: false,
            router: false
        },

        person: {
            super: 'base',
            model: false,
            service: false,
            event: false,
            router: false,
            definition: {
                loginId: {
                    type: 'string',
                    required: true
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
            super: 'person',
            model: true,
            service: true,
            event: true,
            router: true
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
            }
        }
    }
};