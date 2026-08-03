/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
                cartCode: {
                    type: 'string',
                    required: false,
                    description: 'Source cart code converted into this order during checkout placement',
                    searchOptions: {
                        enabled: true
                    }
                },
                sourceCartCode: {
                    type: 'string',
                    required: false,
                    description: 'Original cart business code retained for order projection traceability',
                    searchOptions: {
                        enabled: true
                    }
                },
                workflowCarrierCode: {
                    type: 'string',
                    required: false,
                    description: 'Workflow carrier that created this order projection',
                    searchOptions: {
                        enabled: true
                    }
                },
                placementCode: {
                    type: 'string',
                    required: false,
                    description: 'Checkout placement run or idempotency code that produced this order',
                    searchOptions: {
                        enabled: true
                    }
                },
                status: {
                    type: 'string',
                    required: false,
                    default: 'PLACED',
                    description: 'Order lifecycle status owned by Order workflow and history',
                    searchOptions: {
                        enabled: true
                    }
                },
                currencyCode: {
                    type: 'string',
                    required: false,
                    description: 'Order-level currency evidence copied from checkout context when available',
                    searchOptions: {
                        enabled: true
                    }
                }
            },
            indexes: {
                common: {
                    entCode: {
                        name: 'entCode',
                        enabled: true
                    },
                    status: {
                        name: 'status',
                        enabled: true
                    },
                    cartCode: {
                        name: 'cartCode',
                        enabled: true
                    }
                },
                individual: {
                    placementCode: {
                        name: 'placementCode',
                        enabled: true
                    }
                }
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
        orderDeliveryGroup: {
            super: 'abstractCheckoutDeliveryGroup',
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
                    description: 'Parent order code for this delivery group',
                    searchOptions: {
                        enabled: true
                    }
                },
                cartCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart code retained as delivery-group conversion evidence',
                    searchOptions: {
                        enabled: true
                    }
                },
                sourceDeliveryGroupCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart delivery-group code retained when order conversion remaps delivery group identity',
                    searchOptions: {
                        enabled: true
                    }
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
                }
            }
        },
        orderDeliveryAllocation: {
            super: 'abstractCheckoutAllocation',
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
                },
                entryCode: {
                    enabled: true,
                    schemaName: "orderEntry",
                    type: 'one',
                    propertyName: 'entryCode',
                    onTargetDelete: 'RESTRICT'
                },
                deliveryGroupCode: {
                    enabled: true,
                    schemaName: "orderDeliveryGroup",
                    type: 'one',
                    propertyName: 'deliveryGroupCode',
                    onTargetDelete: 'RESTRICT'
                }
            },
            definition: {
                orderCode: {
                    type: 'string',
                    required: true,
                    description: 'Parent order code for this delivery allocation',
                    searchOptions: {
                        enabled: true
                    }
                },
                cartCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart code retained as delivery-allocation conversion evidence',
                    searchOptions: {
                        enabled: true
                    }
                },
                deliveryGroupCode: {
                    type: 'string',
                    required: true,
                    description: 'Delivery group receiving this allocated order-entry quantity',
                    searchOptions: {
                        enabled: true
                    }
                },
                sourceDeliveryGroupCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart delivery-group code retained when order conversion remaps delivery group identity',
                    searchOptions: {
                        enabled: true
                    }
                },
                sourceAllocationCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart allocation code retained when order conversion remaps allocation identity',
                    searchOptions: {
                        enabled: true
                    }
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
                    },
                    deliveryGroupCode: {
                        name: 'deliveryGroupCode',
                        enabled: true
                    }
                }
            }
        },
        orderPaymentGroup: {
            super: 'abstractCheckoutPaymentGroup',
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
                    description: 'Parent order code for this payment group',
                    searchOptions: {
                        enabled: true
                    }
                },
                cartCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart code retained as payment-group conversion evidence',
                    searchOptions: {
                        enabled: true
                    }
                },
                sourcePaymentGroupCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart payment-group code retained when order conversion remaps payment group identity',
                    searchOptions: {
                        enabled: true
                    }
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
                }
            }
        },
        orderPaymentAllocation: {
            super: 'abstractCheckoutAllocation',
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
                },
                entryCode: {
                    enabled: true,
                    schemaName: "orderEntry",
                    type: 'one',
                    propertyName: 'entryCode',
                    onTargetDelete: 'RESTRICT'
                },
                paymentGroupCode: {
                    enabled: true,
                    schemaName: "orderPaymentGroup",
                    type: 'one',
                    propertyName: 'paymentGroupCode',
                    onTargetDelete: 'RESTRICT'
                }
            },
            definition: {
                orderCode: {
                    type: 'string',
                    required: true,
                    description: 'Parent order code for this payment allocation',
                    searchOptions: {
                        enabled: true
                    }
                },
                cartCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart code retained as payment-allocation conversion evidence',
                    searchOptions: {
                        enabled: true
                    }
                },
                paymentGroupCode: {
                    type: 'string',
                    required: true,
                    description: 'Payment group funding this allocated order-entry quantity',
                    searchOptions: {
                        enabled: true
                    }
                },
                sourcePaymentGroupCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart payment-group code retained when order conversion remaps payment group identity',
                    searchOptions: {
                        enabled: true
                    }
                },
                sourceAllocationCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional source cart allocation code retained when order conversion remaps allocation identity',
                    searchOptions: {
                        enabled: true
                    }
                },
                amount: {
                    type: 'string',
                    required: true,
                    description: 'Exact non-negative decimal-string amount assigned to this payment allocation'
                },
                currencyCode: {
                    type: 'string',
                    required: true,
                    description: 'Currency code used for the allocated payment amount',
                    searchOptions: {
                        enabled: true
                    }
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
                    },
                    paymentGroupCode: {
                        name: 'paymentGroupCode',
                        enabled: true
                    }
                }
            }
        },
        checkoutPlacementRun: {
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
                    description: 'Enterprise code that owns this checkout placement run',
                    searchOptions: {
                        enabled: true
                    }
                },
                placementCode: {
                    type: 'string',
                    required: true,
                    description: 'Stable business identity for one cart-to-order placement workflow run',
                    searchOptions: {
                        enabled: true
                    }
                },
                cartCode: {
                    type: 'string',
                    required: true,
                    description: 'Source cart code submitted for placement',
                    searchOptions: {
                        enabled: true
                    }
                },
                orderCode: {
                    type: 'string',
                    required: false,
                    description: 'Order code produced by the checkout placement workflow when order creation succeeds',
                    searchOptions: {
                        enabled: true
                    }
                },
                workflowCarrierCode: {
                    type: 'string',
                    required: false,
                    description: 'Durable Workflow carrier code that owns long-running placement lifecycle, retry, and recovery evidence',
                    searchOptions: {
                        enabled: true
                    }
                },
                pipelineName: {
                    type: 'string',
                    required: true,
                    description: 'Configured nPipeline definition used only for atomic checkout placement-run evidence steps',
                    searchOptions: {
                        enabled: true
                    }
                },
                idempotencyKey: {
                    type: 'string',
                    required: true,
                    description: 'Caller-provided or generated key used to prevent duplicate order placement for the same checkout attempt',
                    searchOptions: {
                        enabled: true
                    }
                },
                state: {
                    type: 'string',
                    required: true,
                    description: 'Current placement state such as INIT, VALIDATING, RESERVING, ORDERING, COPYING, FINALIZING, COMPLETED, FAILED, or COMPENSATING',
                    searchOptions: {
                        enabled: true
                    }
                },
                currentStep: {
                    type: 'string',
                    required: false,
                    description: 'Most recent workflow action or pipeline node reached by this placement run'
                },
                failureCode: {
                    type: 'string',
                    required: false,
                    description: 'Safe failure code captured when placement cannot continue'
                },
                failureMessage: {
                    type: 'string',
                    required: false,
                    description: 'Safe failure message for operators. Do not store secrets, payment credentials, or raw provider payloads.'
                },
                evidence: {
                    type: 'object',
                    required: false,
                    description: 'Structured non-secret evidence such as created order entries, copied allocation counts, payment requirements, or inventory promise reservation codes'
                }
            },
            indexes: {
                common: {
                    entCode: {
                        name: 'entCode',
                        enabled: true
                    },
                    cartCode: {
                        name: 'cartCode',
                        enabled: true
                    },
                    state: {
                        name: 'state',
                        enabled: true
                    }
                },
                individual: {
                    placementCode: {
                        name: 'placementCode',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    },
                    idempotencyKey: {
                        name: 'idempotencyKey',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    },
                    workflowCarrierCode: {
                        name: 'workflowCarrierCode',
                        enabled: true
                    }
                }
            }
        },
        checkoutReverseRun: {
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
                    description: 'Enterprise code that owns this checkout reverse workflow run',
                    searchOptions: {
                        enabled: true
                    }
                },
                reverseCode: {
                    type: 'string',
                    required: true,
                    description: 'Stable business identity for one order return or refund workflow run',
                    searchOptions: {
                        enabled: true
                    }
                },
                orderCode: {
                    type: 'string',
                    required: true,
                    description: 'Order code being processed by the reverse workflow',
                    searchOptions: {
                        enabled: true
                    }
                },
                returnCode: {
                    type: 'string',
                    required: false,
                    description: 'Fulfillment-owned return request code coordinated by this reverse workflow',
                    searchOptions: {
                        enabled: true
                    }
                },
                refundTransactionCode: {
                    type: 'string',
                    required: false,
                    description: 'Payment-owned refund transaction code coordinated by this reverse workflow',
                    searchOptions: {
                        enabled: true
                    }
                },
                refundCalculationCode: {
                    type: 'string',
                    required: false,
                    description: 'Payment-owned refund calculation evidence code coordinated before provider refund execution',
                    searchOptions: {
                        enabled: true
                    }
                },
                workflowCarrierCode: {
                    type: 'string',
                    required: false,
                    description: 'Durable Workflow carrier code that owns long-running reverse lifecycle, retry, and recovery evidence',
                    searchOptions: {
                        enabled: true
                    }
                },
                idempotencyKey: {
                    type: 'string',
                    required: true,
                    description: 'Caller-provided or generated key used to prevent duplicate reverse workflow runs for the same order return/refund attempt',
                    searchOptions: {
                        enabled: true
                    }
                },
                state: {
                    type: 'string',
                    required: true,
                    description: 'Current reverse workflow state such as INIT, RUNNING, RETURN_REQUESTED, RETURN_RECEIVED, RETURN_DISPOSED, INVENTORY_DISPOSITION_APPLIED, REFUND_CALCULATED, REFUNDED, COMPLETED, FAILED, or COMPENSATING',
                    searchOptions: {
                        enabled: true
                    }
                },
                currentStep: {
                    type: 'string',
                    required: false,
                    description: 'Most recent reverse workflow action reached by this run'
                },
                failureCode: {
                    type: 'string',
                    required: false,
                    description: 'Safe failure code captured when reverse processing cannot continue'
                },
                failureMessage: {
                    type: 'string',
                    required: false,
                    description: 'Safe failure message for operators. Do not store secrets, payment credentials, customer private data, or raw provider payloads.'
                },
                recoveryStrategy: {
                    type: 'string',
                    required: false,
                    description: 'Owner-delegated recovery strategy selected when the reverse workflow enters compensation',
                    searchOptions: {
                        enabled: true
                    }
                },
                recoveryOwner: {
                    type: 'string',
                    required: false,
                    description: 'Primary owning module expected to act on the selected reverse recovery strategy',
                    searchOptions: {
                        enabled: true
                    }
                },
                evidence: {
                    type: 'object',
                    required: false,
                    description: 'Structured non-secret evidence such as return request code, received quantity, refund transaction code, or completion counts'
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
                    },
                    state: {
                        name: 'state',
                        enabled: true
                    },
                    recoveryStrategy: {
                        name: 'recoveryStrategy',
                        enabled: true
                    },
                    recoveryOwner: {
                        name: 'recoveryOwner',
                        enabled: true
                    }
                },
                individual: {
                    reverseCode: {
                        name: 'reverseCode',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    },
                    idempotencyKey: {
                        name: 'idempotencyKey',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    },
                    workflowCarrierCode: {
                        name: 'workflowCarrierCode',
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
                    enum: ['ORDERSTATUS', 'PAYMENT', 'SHIPMENT'],
                    required: true,
                    description: 'Required value could be only in [ORDERSTATUS, PAYMENT, SHIPMENT]'
                }
            }
        },
    }
};
