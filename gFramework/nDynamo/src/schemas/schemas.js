/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    dynamo: {
        classConfiguration: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: {
                enabled: false
            },
            tenants: ['default'],
            definition: {
                type: {
                    enum: [ENUMS.ClassType.SERVICE.key, ENUMS.ClassType.FACADE.key, ENUMS.ClassType.CONTROLLER.key, ENUMS.ClassType.UTILS.key],
                    required: true,
                    description: 'What is type of class [SERVICE, FACADE, CONTROLLER, UTILS]'
                }
            }
        },

        routerConfiguration: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: {
                enabled: true
            },
            tenants: ['default'],
            definition: {
                moduleName: {
                    type: 'string',
                    required: true,
                    description: 'Required moduleName'
                },
                groupName: {
                    type: 'string',
                    required: false,
                    default: 'runtime',
                    description: 'Router group where this runtime route belongs'
                },
                key: {
                    type: 'string',
                    required: true,
                    description: 'Route path relative to the module API version'
                },
                method: {
                    type: 'string',
                    required: true,
                    description: 'HTTP method for this runtime route'
                },
                controller: {
                    type: 'string',
                    required: true,
                    description: 'Controller service name that owns the operation'
                },
                operation: {
                    type: 'string',
                    required: true,
                    description: 'Controller operation to execute'
                },
                secured: {
                    type: 'bool',
                    required: false,
                    default: true,
                    description: 'Whether this runtime route requires authentication'
                },
                apiVersion: {
                    type: 'string',
                    required: false,
                    default: 'v0',
                    description: 'API version segment for this runtime route'
                },
                accessGroups: {
                    type: 'array',
                    required: false,
                    default: ['userGroup'],
                    description: 'User groups allowed to execute this runtime route'
                },
                cache: {
                    type: 'object',
                    required: false,
                    description: 'Optional route cache configuration'
                },
                requestBody: {
                    type: 'object',
                    required: false,
                    description: 'Optional request body contract metadata'
                },
                $override: {
                    type: 'object',
                    required: false,
                    description: 'Governed override metadata for runtime route changes'
                },
            }
        },
        pipeline: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: {
                enabled: true
            },
            tenants: ['default'],
            definition: {

            }
        },

        configurationActivationLog: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: false
            },
            router: {
                enabled: true
            },
            tenants: ['default'],
            definition: {
                configurationType: {
                    type: 'string',
                    required: true,
                    description: 'Runtime configuration type being activated'
                },
                moduleName: {
                    type: 'string',
                    required: false,
                    description: 'Owning module for the runtime configuration'
                },
                configurationCode: {
                    type: 'string',
                    required: true,
                    description: 'Code of the runtime configuration record'
                },
                action: {
                    type: 'string',
                    required: true,
                    description: 'Runtime configuration action being audited'
                },
                status: {
                    type: 'string',
                    required: true,
                    description: 'Activation result status'
                },
                tenant: {
                    type: 'string',
                    required: false,
                    description: 'Tenant used for activation'
                },
                requestedBy: {
                    type: 'string',
                    required: false,
                    description: 'User or process that requested the activation'
                },
                approvalStatus: {
                    type: 'string',
                    required: false,
                    description: 'Approval state for the runtime activation'
                },
                approvedBy: {
                    type: 'string',
                    required: false,
                    description: 'User or process that approved the runtime activation'
                },
                approvalReason: {
                    type: 'string',
                    required: false,
                    description: 'Reason supplied for approving the runtime activation'
                },
                riskLevel: {
                    type: 'string',
                    required: false,
                    description: 'Risk level assigned by runtime activation policy'
                },
                previousSnapshot: {
                    type: 'object',
                    required: false,
                    description: 'Previous effective configuration snapshot'
                },
                nextSnapshot: {
                    type: 'object',
                    required: false,
                    description: 'Next runtime configuration snapshot'
                },
                warnings: {
                    type: 'array',
                    required: false,
                    description: 'Warnings collected during activation'
                },
                error: {
                    type: 'object',
                    required: false,
                    description: 'Activation error details'
                },
                correlationId: {
                    type: 'string',
                    required: false,
                    description: 'Correlation id from the triggering event or request'
                },
                activationRequestCode: {
                    type: 'string',
                    required: false,
                    description: 'Activation request code linked to this activation attempt'
                }
            }
        },

        configurationActivationRequest: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: false
            },
            router: {
                enabled: true
            },
            tenants: ['default'],
            definition: {
                configurationType: {
                    type: 'string',
                    required: true,
                    description: 'Runtime configuration type requested for activation'
                },
                configurationCode: {
                    type: 'string',
                    required: true,
                    description: 'Code of the runtime configuration requested for activation'
                },
                moduleName: {
                    type: 'string',
                    required: false,
                    description: 'Owning module for the runtime configuration'
                },
                requestedBy: {
                    type: 'string',
                    required: false,
                    description: 'User or process that created the activation request'
                },
                requestReason: {
                    type: 'string',
                    required: false,
                    description: 'Reason supplied for requesting activation'
                },
                approvalStatus: {
                    type: 'string',
                    required: false,
                    default: 'PENDING',
                    description: 'Approval status for the activation request'
                },
                approvedBy: {
                    type: 'string',
                    required: false,
                    description: 'User or process that approved the activation request'
                },
                approvalReason: {
                    type: 'string',
                    required: false,
                    description: 'Reason supplied during approval or rejection'
                },
                riskLevel: {
                    type: 'string',
                    required: false,
                    description: 'Risk level computed from activation preview'
                },
                preview: {
                    type: 'object',
                    required: false,
                    description: 'Preview captured when the activation request was created'
                },
                status: {
                    type: 'string',
                    required: false,
                    default: 'REQUESTED',
                    description: 'Lifecycle status of the activation request'
                },
                correlationId: {
                    type: 'string',
                    required: false,
                    description: 'Correlation id from the request'
                },
                activationLogCode: {
                    type: 'string',
                    required: false,
                    description: 'Activation audit log code linked after activation'
                }
            }
        },

        schemaAccessPolicy: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: {
                enabled: true
            },
            tenants: ['default'],
            definition: {
                moduleName: {
                    type: 'string',
                    required: true,
                    description: 'Owning module for the schema access policy'
                },
                schemaName: {
                    type: 'string',
                    required: true,
                    description: 'Schema controlled by this access policy'
                },
                propertyName: {
                    type: 'string',
                    required: false,
                    description: 'Property controlled by this access policy; omit or use * for schema-level defaults'
                },
                userGroups: {
                    type: 'array',
                    required: false,
                    default: [],
                    description: 'User group codes targeted by this access policy'
                },
                actions: {
                    type: 'array',
                    required: true,
                    description: 'Controlled actions: read, create, update, delete, import, or export'
                },
                effect: {
                    type: 'string',
                    required: true,
                    description: 'Policy effect: ALLOW, DENY, MASK, HIDE, or READONLY'
                },
                priority: {
                    type: 'number',
                    required: false,
                    default: 100,
                    description: 'Lower priority values are evaluated first when multiple policies match'
                },
                appliesToTenants: {
                    type: 'array',
                    required: false,
                    default: [],
                    description: 'Optional tenant codes where this policy applies; empty means all active tenants'
                },
                maskStrategy: {
                    type: 'string',
                    required: false,
                    description: 'Masking strategy used when effect is MASK'
                },
                condition: {
                    type: 'object',
                    required: false,
                    description: 'Optional runtime condition evaluated by project-specific policy resolvers'
                },
                effectiveFrom: {
                    type: 'date',
                    required: false,
                    description: 'Optional activation start date for the policy'
                },
                effectiveUntil: {
                    type: 'date',
                    required: false,
                    description: 'Optional activation end date for the policy'
                },
                status: {
                    type: 'string',
                    required: false,
                    default: 'ACTIVE',
                    description: 'Policy lifecycle status'
                },
                reason: {
                    type: 'string',
                    required: false,
                    description: 'Business or governance reason for the policy'
                },
                $override: {
                    type: 'object',
                    required: false,
                    description: 'Governed override metadata for runtime schema access policy changes'
                },
            }
        },

        schemaConfiguration: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: {
                enabled: true
            },
            tenants: ['default'],
            definition: {
                moduleName: {
                    type: 'string',
                    required: true,
                    description: 'Required moduleName'
                },
                super: {
                    type: 'string',
                    required: false,
                    description: 'Optional parent schema within the owning module'
                },
                model: {
                    type: 'bool',
                    required: false,
                    description: 'Whether runtime model generation is enabled'
                },
                service: {
                    type: 'object',
                    required: false,
                    description: 'Runtime service generation configuration'
                },
                router: {
                    type: 'object',
                    required: false,
                    description: 'Runtime router generation configuration'
                },
                event: {
                    type: 'object',
                    required: false,
                    description: 'Runtime event configuration'
                },
                tenants: {
                    type: 'array',
                    required: false,
                    description: 'Tenants where this runtime schema is active'
                },
                definition: {
                    type: 'object',
                    required: false,
                    description: 'Runtime schema property definitions'
                },
                indexes: {
                    type: 'object',
                    required: false,
                    description: 'Runtime database index definitions'
                },
                search: {
                    type: 'object',
                    required: false,
                    description: 'Runtime search schema configuration'
                },
                options: {
                    type: 'object',
                    required: false,
                    description: 'Runtime schema options'
                },
                accessGroups: {
                    type: 'object',
                    required: true,
                    default: undefined,
                    description: 'User group code for which this user belongs'
                },
                $override: {
                    type: 'object',
                    required: false,
                    description: 'Governed override metadata for runtime schema changes'
                },
            }
        }
    }
};
