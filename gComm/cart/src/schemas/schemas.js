/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cart/schemas/schemas
 * @description Cart schema contribution defining abstract cart ownership fields and the concrete persisted cart model.
 * @layer schema
 * @owner cart
 * @override Project modules may extend or govern the cart schema through layered schema fragments without modifying this definition.
 */
module.exports = {
    default: {
        abstractCart: {
            super: 'base',
            model: false,
            service: {
                enabled: false
            },
            router: {
                enabled: false
            },
            definition: {
                entCode: {
                    type: 'string',
                    required: true,
                    description: 'Enterprise code that order belongs',
                    searchOptions: {
                        enabled: true
                    }
                },
                refCode: {
                    type: 'string',
                    required: true,
                    description: 'Merchant unique order code',
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
    },

    cart: {
        cart: {
            super: 'abstractCart',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            cache: {
                enabled: false
            },
            search: {
                enabled: false
            },
            definition: {

            }
        }
    }
};
