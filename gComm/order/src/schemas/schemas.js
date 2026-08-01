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
        orderHistoryEntry: {
            super: 'base',
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
                entCode: {
                    type: 'string',
                    required: true,
                    description: 'Enterprise code that owns the order lifecycle history entry',
                    searchOptions: {
                        enabled: true
                    }
                },
                orderCode: {
                    type: 'string',
                    required: true,
                    description: 'Parent order code for this history entry',
                    searchOptions: {
                        enabled: true
                    }
                },
                historyCode: {
                    type: 'string',
                    required: true,
                    description: 'Stable business identity for this order history event',
                    searchOptions: {
                        enabled: true
                    }
                },
                eventType: {
                    type: 'string',
                    required: true,
                    description: 'Business event type such as STATUS_CHANGE, PAYMENT_EVENT, FULFILLMENT_EVENT, NOTE, or SYSTEM_EVENT',
                    searchOptions: {
                        enabled: true
                    }
                },
                statusFrom: {
                    type: 'string',
                    required: false,
                    description: 'Previous order status when the event represents a status transition'
                },
                statusTo: {
                    type: 'string',
                    required: false,
                    description: 'New order status when the event represents a status transition',
                    searchOptions: {
                        enabled: true
                    }
                },
                reasonCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional order reason code captured as evidence for this event'
                },
                actorType: {
                    type: 'string',
                    required: false,
                    description: 'Actor category that produced the event, such as EMPLOYEE, CUSTOMER, SERVICE, or SYSTEM',
                    searchOptions: {
                        enabled: true
                    }
                },
                actorCode: {
                    type: 'string',
                    required: false,
                    description: 'Actor identity captured for audit and support review'
                },
                sourceModule: {
                    type: 'string',
                    required: false,
                    description: 'Owning module that emitted or recorded the event'
                },
                sourceOperation: {
                    type: 'string',
                    required: false,
                    description: 'Operation, workflow step, pipeline node, or API that produced the event'
                },
                evidenceCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional external evidence, workflow, payment, inventory, fulfillment, or audit reference'
                },
                message: {
                    type: 'string',
                    required: false,
                    description: 'Human-readable lifecycle note. Do not store secrets, payment credentials, or raw provider payloads.'
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
                    historyCode: {
                        name: 'historyCode',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    },
                    eventType: {
                        name: 'eventType',
                        enabled: true
                    },
                    statusTo: {
                        name: 'statusTo',
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
