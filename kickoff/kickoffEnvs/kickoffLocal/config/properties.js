/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    // Local sample credentials are explicit project-layer compatibility values.
    // Deployments must override both values through governed secret configuration.
    defaultAuthDetail: {
        apiKey: process.env.NODICS_BOOTSTRAP_API_KEY || '944515ac-bbac-51cd-ac7e-3bbbb3c81bff'
    },
    bootstrapIdentity: {
        adminPassword: process.env.NODICS_BOOTSTRAP_ADMIN_PASSWORD || 'kickoff-local-admin-change-me',
        servicePassword: process.env.NODICS_BOOTSTRAP_SERVICE_PASSWORD || 'kickoff-local-service-change-me',
        serviceApiKey: process.env.NODICS_BOOTSTRAP_API_KEY || '944515ac-bbac-51cd-ac7e-3bbbb3c81bff'
    },
    authSecurity: {
        jwt: {
            secret: process.env.NODICS_JWT_SECRET || 'kickoff-local-only-jwt-secret-change-before-deployment'
        },
        compatibility: {
            allowInsecureDevelopmentSecret: true
        },
        internalToken: {
            crossTenantGroups: ['userGroup']
        },
        apiKey: {
            allowLegacyHumanPrincipals: true,
            allowLegacyPlaintextLookup: true,
            pepper: process.env.NODICS_API_KEY_PEPPER || 'kickoff-local-api-key-pepper-change-before-deployment'
        },
        securityStamp: {
            failClosed: false,
            allowMissingStamp: true
        }
    },
    test: {
        runtimeTopology: {
            consolidatedServer: 'kickoffLocalServer',
            modularServers: [
                'kickoffLocalProfileServer',
                'kickoffLocalNemsServer',
                'kickoffLocalDeapServer',
                'kickoffLocalCronServer',
                'kickoffLocalCmsServer',
                'kickoffLocalWorkflowServer'
            ],
            communicationChecks: [
                {
                    server: 'kickoffLocalProfileServer',
                    moduleName: 'profile',
                    path: '/v0/ping?help'
                },
                {
                    server: 'kickoffLocalNemsServer',
                    moduleName: 'nems',
                    path: '/v0/ping?help'
                },
                {
                    server: 'kickoffLocalCronServer',
                    moduleName: 'cronjob',
                    path: '/v0/ping?help'
                },
                {
                    server: 'kickoffLocalWorkflowServer',
                    moduleName: 'workflow',
                    path: '/v0/ping?help'
                }
            ]
        }
    }
};
