/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/schemas/schemas
 * @description Order schema contribution defining order, order status, payment status, shipping status, and reason models.
 * @layer schema
 * @owner order
 * @override Project modules may extend or govern order schemas through layered schema fragments without modifying this definition.
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
        orderEntry: {
            super: 'abstractCartEntry',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: false
            },
            cache: {
                enabled: false
            },
            search: {
                enabled: false
            },
            refSchema: {
                orderCode: {
                    enabled: true,
                    schemaName: "order",
                    type: 'one',
                    propertyName: 'code',
                    onTargetDelete: 'RESTRICT'
                }
            },
            definition: {
                orderCode: {
                    type: 'string',
                    required: true,
                    description: 'Parent order code. Order owns lifecycle while entries own immutable line-level evidence.',
                    searchOptions: {
                        enabled: true
                    }
                },
                cartCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart code retained as conversion evidence',
                    searchOptions: {
                        enabled: true
                    }
                },
                allocationCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional Inventory allocation evidence for this order line'
                },
                reservationCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional Inventory reservation evidence consumed by this order line'
                }
            },
            indexes: {
                common: {
                    entCode: {
                        name: 'entCode',
                        enabled: true
                    },
                    orderCode: {
                        name: 'orderCode',
                        enabled: true
                    }
                },
                individual: {
                    entryCode: {
                        name: 'entryCode',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    },
                    lineNumber: {
                        name: 'lineNumber',
                        enabled: true
                    },
                    itemCode: {
                        name: 'itemCode',
                        enabled: true
                    },
                    status: {
                        name: 'status',
                        enabled: true
                    }
                }
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
