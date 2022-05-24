/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    order: {
        order: {
            refSchema: {
                token: {
                    enabled: true,
                    schemaName: "token",
                    type: 'one',
                    propertyName: '_id',
                    searchEnabled: true
                }
            },
            definition: {
                refCode: {
                    type: 'string',
                    required: true,
                    description: 'Merchant unique order code',
                    searchOptions: {
                        enabled: true
                    }
                },
                token: {
                    type: 'string',
                    required: true,
                    description: 'Required token to set order validity',
                    searchOptions: {
                        enabled: true
                    }
                }
            },
            indexes: {
                individual: {
                    refCode: {
                        name: 'refCode',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    }
                }
            }
        }
    }
};