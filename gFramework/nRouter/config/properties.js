/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nRouter/config/properties
 * @description Default router configuration for route initialization order, body/response handlers, authorization, and server endpoints.
 * @layer config
 * @owner nRouter
 * @override Project, environment, server, or node modules may override router properties through layered configuration without changing framework defaults.
 */
module.exports = {
    routerInitFunction: [
        'initProperties',
        'initSession',
        'initLogger',
        'initCache',
        'initBodyParser',
        'initHeaders',
        'initErrorRoutes',
        'initExtras'
    ],
    bodyParserHandler: {
        jsonBodyParserHandler: 'DefaultJsonBodyParserHandlerService',
        textBodyParserHandler: 'DefaultTextBodyParserHandlerService'
    },
    httpHardening: {
        enabled: true,
        trustProxy: false,
        body: {
            urlencoded: {
                extended: true,
                limit: '1mb',
                parameterLimit: 1000
            },
            json: {
                limit: '1mb',
                strict: true
            },
            text: {
                limit: '1mb',
                type: 'text/*'
            }
        },
        securityHeaders: {
            enabled: true,
            headers: {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; object-src 'none'",
                'Referrer-Policy': 'no-referrer',
                'Cross-Origin-Resource-Policy': 'same-origin',
                'X-XSS-Protection': '0'
            }
        },
        cors: {
            enabled: false,
            allowedOrigins: [],
            allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-CSRF-Token', 'X-Request-Id',
                'X-Correlation-Id', 'X-Nodics-Client-Contract-Version', 'X-Enterprise-Code',
                'X-Nodics-Enterprise', 'X-Nodics-Tenant'],
            exposedHeaders: ['Retry-After', 'X-Request-Id', 'X-Correlation-Id', 'X-RateLimit-Limit',
                'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
            allowCredentials: false,
            maxAge: 600
        },
        rateLimit: {
            enabled: true,
            windowMs: 60000,
            max: 600,
            skipOptions: true,
            keyHeaders: ['x-forwarded-for', 'x-real-ip']
        }
    },

    responseHandler: {
        jsonResponseHandler: 'DefaultJsonResponseHandlerService',
        textResponseHandler: 'DefaultTextResponseHandlerService',
        fileDownloadResponseHandler: 'DefaultFileDownloadResponseHandlerService'
    },
    routeActionAuthorization: {
        enabled: true,
        strict: true,
        superPermissions: ['*', 'runtime.config.*'],
        groupPermissions: {
            serviceAccountUserGroup: ['auth.internal.token.read', 'auth.internal.token.read.anyTenant']
        }
    },
    apiExposure: {
        default: {
            enabled: true
        },
        categories: {
            runtimeConfiguration: {
                enabled: true
            },
            schemaMaintenance: {
                enabled: true
            },
            openApiContract: {
                enabled: true
            },
            operationalHealth: {
                enabled: true
            },
            serviceRegistry: {
                enabled: false
            },
            fileAccess: {
                enabled: false
            },
            dataImport: {
                enabled: false
            },
            dataExport: {
                enabled: false
            },
            logManagement: {
                enabled: false
            },
            testExecution: {
                enabled: false
            },
            dynamicClass: {
                enabled: false
            }
        }
    },
    tooling: {
        commands: {
            'docs:openapi': {
                description: 'Generate OpenAPI from effective router and schema contracts.',
                handler: '@nTooling/node-script',
                script: 'src/service/tooling/defaultOpenapiContractGeneratorService.js'
            }
        }
    },
    servers: {
        options: {
            contextRoot: 'nodics'
        },
        default: {
            options: {
                contextRoot: 'nodics'
            },
            endpoint: {
                httpHost: 'localhost',
                httpPort: 3000,

                httpsHost: 'localhost',
                httpsPort: 3001
            },
            abstractEndpoint: {
                httpHost: 'localhost',
                httpPort: 3000,

                httpsHost: 'localhost',
                httpsPort: 3001
            },//Clusters information is optional and will be managed for Backoffice application
            nodes: {
                node0: {
                    httpHost: 'localhost',
                    httpPort: 3000,

                    httpsHost: 'localhost',
                    httpsPort: 3001
                }
            }
        }
    }
};
