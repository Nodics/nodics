/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
                },
                mediaSchema: {
                    type: 'object',
                    required: false,
                    description: 'Declarative CMS media-association contract; actual media lifecycle remains owned by nMedia'
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
                },
                channels: {
                    type: 'array',
                    required: true,
                    default: ['web'],
                    description: 'Delivery channels for which the renderer mapping is supported',
                },
                deprecated: {
                    type: 'bool',
                    required: true,
                    default: false,
                    description: 'Signals that new content should migrate away from this renderer contract',
                },
                replacementRenderer: {
                    type: 'string',
                    required: false,
                    description: 'Optional logical renderer key recommended when this mapping is deprecated',
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
        cmsComponentTypeGroup: {
            super: 'cmsBase',
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
                enabled: true
            },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            refSchema: {
                componentTypeCodes: {
                    enabled: true,
                    schemaName: 'cmsTypeCode',
                    type: 'many',
                    propertyName: 'code',
                    searchEnabled: true
                }
            },
            definition: {
                name: {
                    type: 'string',
                    required: true,
                    description: 'Human-readable component type group name',
                    searchOptions: {
                        enabled: true,
                    }
                },
                description: {
                    type: 'string',
                    required: false,
                    description: 'Business description of the component type group'
                },
                componentTypeCodes: {
                    type: 'array',
                    required: true,
                    description: 'CMS component type codes belonging to this authoring group',
                    searchOptions: {
                        enabled: true,
                    }
                },
                status: {
                    type: 'string',
                    required: true,
                    default: 'ACTIVE',
                    enum: ['ACTIVE', 'INACTIVE'],
                    description: 'Authoring availability for this component type group',
                    searchOptions: {
                        enabled: true,
                    }
                },
                sortOrder: {
                    type: 'int',
                    required: true,
                    default: 100,
                    description: 'Authoring display order for this component type group'
                }
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
                },
                properties: {
                    type: 'object',
                    required: false,
                    description: 'Declarative client-safe component properties validated against the component type contract'
                },
                accessMode: {
                    type: 'string',
                    required: true,
                    default: 'AUTHENTICATED',
                    enum: ['PUBLIC', 'AUTHENTICATED'],
                    description: 'Fail-closed component delivery boundary; public pages may contain only PUBLIC components'
                }
            }
        },
        cmsComponentMedia: {
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
                idPropertyName: 'componentMediaCode',
            },
            cache: {
                enabled: false,
                ttl: 1000
            },
            refSchema: {
                componentCode: {
                    enabled: true,
                    schemaName: 'cmsComponent',
                    type: 'one',
                    propertyName: 'code',
                    searchEnabled: true
                }
            },
            definition: {
                componentMediaCode: {
                    type: 'string',
                    required: true,
                    description: 'Stable CMS-owned media association identity'
                },
                componentCode: {
                    type: 'string',
                    required: true,
                    description: 'CMS component code that owns this media placement'
                },
                mediaCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional nMedia-owned single media item reference'
                },
                mediaSetCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional nMedia-owned media set reference for responsive, localized, or gallery assets'
                },
                mediaType: {
                    type: 'string',
                    required: true,
                    enum: ['IMAGE', 'VIDEO', 'DOCUMENT', 'FILE', 'MIXED'],
                    default: 'IMAGE',
                    description: 'Business media category expected by the CMS component renderer'
                },
                role: {
                    type: 'string',
                    required: true,
                    description: 'CMS-owned role such as primary, background, thumbnail, icon, gallery, or document'
                },
                slot: {
                    type: 'string',
                    required: false,
                    default: 'default',
                    description: 'Optional logical media slot within the component'
                },
                localeCode: {
                    type: 'string',
                    required: false,
                    description: 'Optional locale for localized media selection'
                },
                position: {
                    type: 'int',
                    required: true,
                    default: 100,
                    description: 'Ordered media position within component, role, slot, and locale'
                },
                altText: {
                    type: 'string',
                    required: false,
                    description: 'Accessible media text owned by CMS content'
                },
                caption: {
                    type: 'string',
                    required: false,
                    description: 'Optional CMS-owned caption for the media placement'
                }
            },
            indexes: {
                common: {
                    componentCode: { enabled: true, name: 'componentCode' },
                    componentMediaCode: { enabled: true, name: 'componentMediaCode' }
                },
                individual: {
                    componentMediaCode: { enabled: true, name: 'componentMediaCode' },
                    componentCode: { enabled: true, name: 'componentCode' },
                    mediaCode: { enabled: true, name: 'mediaCode' },
                    mediaSetCode: { enabled: true, name: 'mediaSetCode' },
                    role: { enabled: true, name: 'role' },
                    slot: { enabled: true, name: 'slot' },
                    position: { enabled: true, name: 'position' }
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
        cmsNavigationNode: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            refSchema: {
                site: { enabled: true, schemaName: 'cmsSite', type: 'one', propertyName: 'code', searchEnabled: true },
                parent: { enabled: true, schemaName: 'cmsNavigationNode', type: 'one', propertyName: 'code', searchEnabled: true },
                targetPage: { enabled: true, schemaName: 'cmsPage', type: 'one', propertyName: 'code', searchEnabled: true },
                targetRoute: { enabled: true, schemaName: 'cmsPageRoute', type: 'one', propertyName: 'code', searchEnabled: true },
                restrictions: { enabled: true, schemaName: 'cmsRestriction', type: 'many', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                site: { type: 'string', required: true, description: 'CMS site code owning this navigation node', searchOptions: { enabled: true } },
                parent: { type: 'string', required: false, description: 'Optional parent navigation node code', searchOptions: { enabled: true } },
                name: { type: 'string', required: true, description: 'Internal navigation node name', searchOptions: { enabled: true } },
                title: { type: 'string', required: false, description: 'Display title for navigation renderers', searchOptions: { enabled: true } },
                nodeType: { type: 'string', required: true, default: 'PAGE', enum: ['PAGE', 'ROUTE', 'EXTERNAL', 'CONTAINER'], description: 'Navigation target behavior' },
                targetPage: { type: 'string', required: false, description: 'Target CMS page when nodeType is PAGE', searchOptions: { enabled: true } },
                targetRoute: { type: 'string', required: false, description: 'Target CMS page route when nodeType is ROUTE', searchOptions: { enabled: true } },
                externalUrl: { type: 'string', required: false, description: 'Safe external URL when nodeType is EXTERNAL; validation remains service-owned' },
                position: { type: 'int', required: true, default: 100, description: 'Sibling ordering position' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this navigation node', searchOptions: { enabled: true } },
                locale: { type: 'string', required: true, default: 'default', description: 'Locale scope or default fallback', searchOptions: { enabled: true } },
                channel: { type: 'string', required: true, default: 'web', description: 'Delivery channel scope', searchOptions: { enabled: true } },
                restrictions: { type: 'array', required: false, description: 'Optional CMS restriction codes applied to this navigation node' }
            },
            indexes: {
                composite: {
                    site: { enabled: true, name: 'site', options: { unique: true } },
                    parent: { enabled: true, name: 'parent', options: { unique: true } },
                    position: { enabled: true, name: 'position', options: { unique: true } },
                    locale: { enabled: true, name: 'locale', options: { unique: true } },
                    channel: { enabled: true, name: 'channel', options: { unique: true } }
                },
                individual: {
                    site: { enabled: true, name: 'site' },
                    parent: { enabled: true, name: 'parent' },
                    targetPage: { enabled: true, name: 'targetPage' },
                    targetRoute: { enabled: true, name: 'targetRoute' },
                    status: { enabled: true, name: 'status' }
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
                allowedComponentTypes: { type: 'array', required: false, description: 'Optional allowlist of component type codes' },
                allowedComponentTypeGroups: { type: 'array', required: false, description: 'Optional allowlist of CMS component type group codes' }
            }
        },
        cmsRestrictionType: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            definition: {
                name: { type: 'string', required: true, description: 'Human-readable restriction type name', searchOptions: { enabled: true } },
                description: { type: 'string', required: false, description: 'Business description of the restriction type' },
                targetTypes: { type: 'array', required: true, default: ['PAGE', 'COMPONENT', 'SLOT', 'NAVIGATION', 'ROUTE'], description: 'CMS target kinds to which this restriction type can apply', searchOptions: { enabled: true } },
                propertySchema: { type: 'object', required: false, description: 'Declarative restriction property contract; executable code is prohibited' },
                evaluator: { type: 'string', required: false, description: 'Logical backend evaluator key resolved by CMS services; never executable code or a client path' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Authoring availability for this restriction type', searchOptions: { enabled: true } }
            }
        },
        cmsRestriction: {
            super: 'cmsBase',
            isVersionedEnabled: false,
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            cache: { enabled: true, ttl: 10000 },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            refSchema: {
                restrictionType: { enabled: true, schemaName: 'cmsRestrictionType', type: 'one', propertyName: 'code', searchEnabled: true }
            },
            definition: {
                name: { type: 'string', required: true, description: 'Human-readable restriction name', searchOptions: { enabled: true } },
                restrictionType: { type: 'string', required: true, description: 'CMS restriction type code', searchOptions: { enabled: true } },
                targetType: { type: 'string', required: true, enum: ['PAGE', 'COMPONENT', 'SLOT', 'NAVIGATION', 'ROUTE'], description: 'CMS target kind guarded by this restriction', searchOptions: { enabled: true } },
                targetCode: { type: 'string', required: true, description: 'Code of the page, component, slot, navigation node, or route guarded by this restriction', searchOptions: { enabled: true } },
                mode: { type: 'string', required: true, default: 'INCLUDE', enum: ['INCLUDE', 'EXCLUDE'], description: 'Whether matching users or contexts can access or are excluded from the target' },
                properties: { type: 'object', required: false, description: 'Declarative restriction values validated against the restriction type propertySchema' },
                status: { type: 'string', required: true, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Restriction lifecycle state', searchOptions: { enabled: true } },
                priority: { type: 'int', required: true, default: 100, description: 'Evaluation order for multiple restrictions on the same target' }
            },
            indexes: {
                composite: {
                    targetType: { enabled: true, name: 'targetType', options: { unique: true } },
                    targetCode: { enabled: true, name: 'targetCode', options: { unique: true } },
                    restrictionType: { enabled: true, name: 'restrictionType', options: { unique: true } }
                },
                individual: {
                    restrictionType: { enabled: true, name: 'restrictionType' },
                    targetType: { enabled: true, name: 'targetType' },
                    targetCode: { enabled: true, name: 'targetCode' },
                    status: { enabled: true, name: 'status' }
                }
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
