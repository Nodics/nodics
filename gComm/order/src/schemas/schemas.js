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
        },
        orderstatus: {
            super: 'base',
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
                name: {
                    type: 'string',
                    required: true,
                    description: 'Name of the order status, could be used to display to customer',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                sequence: {
                    type: 'string',
                    required: true,
                    description: 'Sequence number to track valid next order status ',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                }
            }
        },
        paymentstatus: {
            super: 'orderstatus'
        },
        shippingstatus: {
            super: 'orderstatus'
        },
        reasons: {
            super: 'super',
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
                orderstatus: {
                    type: 'string',
                    required: true,
                    description: 'Code of the order status',
                    searchOptions: {
                        enabled: true
                    }
                },
                type: {
                    enum: [ENUMS.ReasonType.ORDERSTATUS.key, ENUMS.ReasonType.PAYMENT.key, ENUMS.ReasonType.SHIPMENT.key],
                    required: true,
                    description: 'Required value could be only in [ORDERSTATUS, PAYMENT, SHIPMENT]'
                }
            }
        },
    }
};