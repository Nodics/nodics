/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    cms: {
        typeCode: {
            super: 'base',
            model: true,
            service: true,
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: true,
            definition: {

            }
        },
        typeCode2Renderer: {
            super: 'base',
            model: true,
            service: true,
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: true,
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
            service: false,
            cache: {
                enabled: true,
                ttl: 10000
            },
            router: false,
            definition: {
            }
        },
        cmsSite: {
            super: 'cmsBase',
            model: true,
            service: true,
            router: true,
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
                    required: true,
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
        cmsPage: {
            super: 'cmsBase',
            model: true,
            service: true,
            router: true,
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
                    schemaName: "typeCode",
                    type: 'one',
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
                    required: true,
                    description: 'Required renderer, this could be name of js, html file, which render required look and feel for this page',
                }
            }
        },
        cmsComponent: {
            super: 'cmsBase',
            model: true,
            service: true,
            router: true,
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            cache: {
                enabled: false,
                ttl: 1000
            },
            refSchema: {
                cmsPages: {
                    schemaName: "cmsPage",
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                },
                superComponents: {
                    schemaName: "cmsComponent",
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                },
                typeCode: {
                    schemaName: "typeCode",
                    type: 'one',
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
                cmsPages: {
                    type: 'array',
                    required: true,
                    description: 'Required Code of associated cmsPage. One component could be associated with multiple cmsPage',
                    searchOptions: {
                        enabled: true,
                    }
                },
                superComponents: {
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
                    required: true,
                    description: 'Required renderer, this could be name of js, html file, which render required look and feel for this components',
                },
                position: {
                    type: 'int',
                    required: true,
                    default: 0
                },
            }
        }
    }
};