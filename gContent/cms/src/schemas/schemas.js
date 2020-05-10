/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    cms: {
        cmsTypeCode: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: {
                enabled: true
            },
            definition: {

            }
        },
        cmsTypeCode2Renderer: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: {
                enabled: true
            },
            definition: {
                renderer: {
                    type: 'string',
                    required: true,
                    description: 'Required renderer, this could be name of js, html file',
                }
            }
        },
        cmsBase: {
            super: 'base',
            model: false,
            service: {
                enabled: false
            },
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: {
                enabled: false
            },
            definition: {
            }
        },
        cmsSite: {
            super: 'cmsBase',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            refSchema: {
                catalog: {
                    schemaName: "catalog",
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                },
            },
            definition: {
                name: {
                    type: 'string',
                    required: false,
                    description: 'Required cms site name',
                    searchOptions: {
                        enabled: true,
                    }
                },
                catalog: {
                    type: 'string',
                    required: true,
                    description: 'Required Code of associated catalog',
                    searchOptions: {
                        enabled: true,
                    }
                }
            }
        },

        cmsComponentDetail: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: {
                enabled: false
            },
            refSchema: {
                target: {
                    schemaName: "cmsComponent",
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                },
            },
            definition: {
                source: {
                    type: 'string',
                    required: true,
                    default: 0,
                    description: 'Required source component, it could be a page or component itself',
                },
                target: {
                    type: 'string',
                    required: true,
                    default: 0,
                    description: 'Required target component, it will be component',
                },
                index: {
                    type: 'int',
                    required: true,
                    default: 0,
                    description: 'Required position of this component in the super component',
                }
            },
            indexes: {
                composite: {
                    source: {
                        enabled: true,
                        name: 'source',
                        options: {
                            unique: true
                        }
                    },
                    target: {
                        enabled: true,
                        name: 'target',
                        options: {
                            unique: true
                        }
                    }
                }
            }
        },

        cmsPage: {
            super: 'cmsBase',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            refSchema: {
                cmsSite: {
                    schemaName: "cmsSite",
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                },
                typeCode: {
                    schemaName: "cmsTypeCode",
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                },
                cmsComponents: {
                    schemaName: "cmsComponentDetail",
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                },
            },
            definition: {
                name: {
                    type: 'string',
                    required: true,
                    description: 'Required cms site name',
                    searchOptions: {
                        enabled: true,
                    }
                },
                cmsSite: {
                    type: 'array',
                    required: true,
                    description: 'Required Code of associated cmsSites. One page could be associated with multiple cmsSites',
                    searchOptions: {
                        enabled: true,
                    }
                },
                typeCode: {
                    type: 'string',
                    required: true,
                    description: 'Required type code, this is used filter same type of pages. like ProductDetailPage',
                    searchOptions: {
                        enabled: true,
                    }
                },
                renderer: {
                    type: 'string',
                    required: false,
                    description: 'Required renderer, this could be name of js, html file, which render required look and feel for this page',
                },
                cmsComponents: {
                    type: 'array',
                    required: true,
                    description: 'Required Code of associated cmsComponent. One page could be have multiple cmsComponent',
                    searchOptions: {
                        enabled: true,
                    }
                },
            }
        },
        cmsComponent: {
            super: 'cmsBase',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            cache: {
                enabled: false,
                ttl: 1000
            },
            refSchema: {
                subComponents: {
                    schemaName: "cmsComponentDetail",
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                },
                typeCode: {
                    schemaName: "cmsTypeCode",
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                },
            },
            definition: {
                subComponents: {
                    type: 'array',
                    required: false,
                    description: 'List of sub cmsComponents if any'
                },
                typeCode: {
                    type: 'string',
                    required: true,
                    description: 'Required type code, this is used filter same type of components. like ',
                    searchOptions: {
                        enabled: true,
                    }
                },
                renderer: {
                    type: 'string',
                    required: false,
                    description: 'Required renderer, this could be name of js, html file, which render required look and feel for this components',
                }
            }
        }
    }
};