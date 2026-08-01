/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

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
        },
        abstractCartEntry: {
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
                    description: 'Enterprise code that owns the checkout line entry',
                    searchOptions: {
                        enabled: true
                    }
                },
                entryCode: {
                    type: 'string',
                    required: true,
                    description: 'Stable business identity for one cart or order line entry',
                    searchOptions: {
                        enabled: true
                    }
                },
                lineNumber: {
                    type: 'int',
                    required: true,
                    description: 'Human-readable line position inside the parent cart or order',
                    searchOptions: {
                        enabled: true
                    }
                },
                catalogCode: {
                    type: 'string',
                    required: true,
                    description: 'Catalog that owns the referenced product item',
                    searchOptions: {
                        enabled: true
                    }
                },
                itemType: {
                    type: 'string',
                    required: true,
                    description: 'Product item type captured for the checkout line',
                    searchOptions: {
                        enabled: true
                    }
                },
                itemCode: {
                    type: 'string',
                    required: true,
                    description: 'Product item code captured for the checkout line',
                    searchOptions: {
                        enabled: true
                    }
                },
                quantity: {
                    type: 'string',
                    required: true,
                    description: 'Exact positive decimal-string quantity; never use floating point for commerce quantities'
                },
                unitCode: {
                    type: 'string',
                    required: true,
                    description: 'Units-owned unit of measure reference for the quantity',
                    searchOptions: {
                        enabled: true
                    }
                },
                currencyCode: {
                    type: 'string',
                    required: true,
                    description: 'Currency code used for persisted monetary evidence',
                    searchOptions: {
                        enabled: true
                    }
                },
                unitPrice: {
                    type: 'string',
                    required: false,
                    description: 'Exact decimal-string unit price snapshot captured by checkout or pricing evidence'
                },
                totalPrice: {
                    type: 'string',
                    required: false,
                    description: 'Exact decimal-string line total snapshot captured by checkout or pricing evidence'
                },
                taxTotal: {
                    type: 'string',
                    required: false,
                    description: 'Exact decimal-string tax total snapshot; Tax remains authoritative for calculation rules'
                },
                discountTotal: {
                    type: 'string',
                    required: false,
                    description: 'Exact decimal-string discount total snapshot; Promotion/Discount remains authoritative for calculation rules'
                },
                priceEvidenceCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional pricing evidence or resolved price reference used to produce the line price'
                },
                status: {
                    type: 'string',
                    required: true,
                    default: 'ACTIVE',
                    description: 'Line lifecycle status within the parent checkout aggregate',
                    searchOptions: {
                        enabled: true
                    }
                }
            },
            indexes: {
                individual: {
                    entryCode: {
                        name: 'entryCode',
                        enabled: true,
                        options: {
                            unique: true
                        }
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
        },
        cartEntry: {
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
                cartCode: {
                    enabled: true,
                    schemaName: "cart",
                    type: 'one',
                    propertyName: 'code',
                    onTargetDelete: 'RESTRICT'
                }
            },
            definition: {
                cartCode: {
                    type: 'string',
                    required: true,
                    description: 'Parent cart code. Cart owns cart state while entries own line-level evidence.',
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
                    cartCode: {
                        name: 'cartCode',
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
        }
    }
};
