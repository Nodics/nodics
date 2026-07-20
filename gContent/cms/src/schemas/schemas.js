/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/schemas/schemas
 * @description CMS schema contribution defining type codes, renderer mappings, sites, pages, components, and component-detail relationships.
 * @layer schema
 * @owner cms
 * @override Project modules may extend or govern CMS schemas through layered schema fragments without modifying this definition.
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
                kind: {
                    type: 'string',
                    required: true,
                    default: 'COMPONENT',
                    enum: ['PAGE', 'COMPONENT'],
                    description: 'Declares whether the type classifies pages or components'
                },
                contractVersion: {
                    type: 'int',
                    required: true,
                    default: 1,
                    description: 'Major version of the declarative type contract'
                },
                propertySchema: {
                    type: 'object',
                    required: false,
                    description: 'Declarative property contract; executable code is prohibited'
                }
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
                    description: 'Logical renderer key resolved by an API consumer; never an executable path or URL',
                },
                contractVersion: {
                    type: 'int',
                    required: true,
                    default: 1,
                    description: 'Major renderer contract version understood by compatible API consumers',
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
                    enabled: true,
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
            isVersionedEnabled: false,
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
                    enabled: true,
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
                },
                slot: {
                    type: 'string',
                    required: false,
                    default: 'default',
                    description: 'Logical template slot containing this ordered component association',
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
                    },
                    slot: {
                        enabled: true,
                        name: 'slot',
                        options: {
                            unique: true
                        }
                    }
                }
            }
        },

        cmsPage: {
            super: 'cmsBase',
            isVersionedEnabled: false,
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
                    enabled: true,
                    schemaName: "cmsSite",
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                },
                typeCode: {
                    enabled: true,
                    schemaName: "cmsTypeCode",
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                },
                cmsComponents: {
                    enabled: true,
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
                template: {
                    type: 'string',
                    required: false,
                    description: 'Optional page template code defining the available composition slots'
                },
                renderer: {
                    type: 'string',
                    required: false,
                    description: 'Optional logical renderer key overriding the type-code renderer mapping',
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
            isVersionedEnabled: false,
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
                    enabled: true,
                    schemaName: "cmsComponentDetail",
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                },
                typeCode: {
                    enabled: true,
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
                    description: 'Optional logical renderer key overriding the type-code renderer mapping',
                }
            }
        },
        cmsPageRoute: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            definition: {
                site: { type: 'string', required: true, description: 'CMS site code owning the route' },
                path: { type: 'string', required: true, description: 'Normalized absolute route path' },
                locale: { type: 'string', required: true, default: 'default', description: 'Locale scope or default fallback' },
                channel: { type: 'string', required: true, default: 'web', description: 'Delivery channel scope' },
                page: { type: 'string', required: true, description: 'Target CMS page code' },
                routeType: { type: 'string', required: true, default: 'PAGE', enum: ['PAGE', 'ALIAS', 'REDIRECT'], description: 'Route resolution behavior' },
                redirectPath: { type: 'string', required: false, description: 'Safe relative redirect target for REDIRECT routes' },
                deliveryState: { type: 'string', required: true, default: 'DRAFT', enum: ['DRAFT', 'ONLINE'], description: 'Fail-closed delivery activation state; workflow publishing may govern transition later' },
                accessMode: { type: 'string', required: true, default: 'AUTHENTICATED', enum: ['PUBLIC', 'AUTHENTICATED'], description: 'Required delivery access boundary' }
            },
            indexes: {
                composite: {
                    site: { enabled: true, name: 'site', options: { unique: true } },
                    path: { enabled: true, name: 'path', options: { unique: true } },
                    locale: { enabled: true, name: 'locale', options: { unique: true } },
                    channel: { enabled: true, name: 'channel', options: { unique: true } }
                }
            }
        },
        cmsPageTemplate: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            refSchema: {
                slots: { enabled: true, schemaName: 'cmsSlotDefinition', type: 'many', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                name: { type: 'string', required: true, description: 'Human-readable template name' },
                renderer: { type: 'string', required: true, description: 'Logical renderer key for the template shell' },
                contractVersion: { type: 'int', required: true, default: 1, description: 'Template contract major version' },
                slots: { type: 'array', required: false, description: 'Owned slot definitions' }
            }
        },
        cmsSlotDefinition: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            definition: {
                template: { type: 'string', required: true, description: 'Owning page template code' },
                name: { type: 'string', required: true, description: 'Stable logical slot name' },
                minItems: { type: 'int', required: false, default: 0, description: 'Minimum allowed component count' },
                maxItems: { type: 'int', required: false, description: 'Maximum allowed component count' },
                allowedComponentTypes: { type: 'array', required: false, description: 'Optional allowlist of component type codes' }
            }
        },
        cmsMigrationAudit: {
            super: 'base',
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                migrationVersion: { type: 'int', required: true },
                status: { type: 'string', required: true },
                tenant: { type: 'string', required: true },
                requestedBy: { type: 'string', required: false },
                preview: { type: 'object', required: false },
                snapshot: { type: 'object', required: false },
                result: { type: 'object', required: false },
                correlationId: { type: 'string', required: false }
            }
        },
        cmsPublicationManifest: {
            super: 'base',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                publicationCode: { type: 'string', required: true, description: 'Owning nPublish request identity' },
                rootType: { type: 'string', required: true },
                rootCode: { type: 'string', required: true },
                sourceVersion: { type: 'string', required: true },
                dependencies: { type: 'array', required: true, description: 'Frozen schema, code, and version identities' },
                snapshot: { type: 'object', required: true, description: 'Immutable client-safe CMS delivery graph' },
                contentHash: { type: 'string', required: true, description: 'Deterministic manifest integrity identifier' },
                createdBy: { type: 'string', required: false },
                correlationId: { type: 'string', required: false }
            }
        },
        cmsOnlinePublicationPointer: {
            super: 'base',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                site: { type: 'string', required: true },
                path: { type: 'string', required: true },
                locale: { type: 'string', required: true },
                channel: { type: 'string', required: true },
                accessMode: { type: 'string', required: true },
                manifestCode: { type: 'string', required: true },
                previousManifestCode: { type: 'string', required: false },
                revision: { type: 'int', required: true, default: 0 },
                activatedBy: { type: 'string', required: false },
                correlationId: { type: 'string', required: false }
            },
            indexes: {
                composite: {
                    site: { enabled: true, name: 'site', options: { unique: true } },
                    path: { enabled: true, name: 'path', options: { unique: true } },
                    locale: { enabled: true, name: 'locale', options: { unique: true } },
                    channel: { enabled: true, name: 'channel', options: { unique: true } },
                    accessMode: { enabled: true, name: 'accessMode', options: { unique: true } }
                }
            }
        },
        cmsPublicationDeploymentReceipt: {
            super: 'base',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                manifestCode: { type: 'string', required: true },
                operation: { type: 'string', required: true, enum: ['DEPLOY', 'ROLLBACK'] },
                status: { type: 'string', required: true, enum: ['ONLINE'] },
                targetVersion: { type: 'string', required: true },
                previousOnlineVersion: { type: 'string', required: false },
                correlationId: { type: 'string', required: false }
            }
        }
    }
};
