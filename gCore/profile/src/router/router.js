/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        loadDefaults: {
            getAPIKey: {
                secured: true,
                key: '/apikey/:tntCode',
                method: 'GET',
                controller: 'DefaultAPIKeyController',
                operation: 'getAPIKey',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/profileapikey/:tntCode',
                    body: {
                        apiKey: 'xxxxxx--xxxx---xxxx---xxxxx'
                    }
                }
            },
            getEnterprise: {
                secured: true,
                cache: {
                    enabled: false,
                    ttl: 20
                },
                key: '/enterprise/get',
                method: 'GET',
                handler: 'DefaultEnterpriseController',
                operation: 'getEnterprise',
                help: {
                    requestType: 'secured',
                    message: 'enterpriseCode need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/profile/enterprise/get',
                }
            },
            getTenants: {
                secured: true,
                cache: {
                    enabled: true,
                    ttl: 200
                },
                key: '/tenant/get',
                method: 'GET',
                handler: 'DefaultTenantController',
                operation: 'getTenants',
                help: {
                    requestType: 'secured',
                    method: 'GET',
                    url: 'http://host:port/nodics/profile/tenant/get',
                }
            }
        },

        authenticate: {
            authenticateEmployee: {
                secured: true,
                key: '/employee/authenticate',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'authenticateEmployee',
                help: {
                    requestType: 'secured',
                    message: 'loginId, password and enterpriseCode need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/authenticate',
                }
            },
            authenticateCustomer: {
                secured: true,
                key: '/customer/authenticate',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'authenticateCustomer',
                help: {
                    requestType: 'secured',
                    message: 'loginId, password and enterpriseCode need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/authenticate',
                }
            }
        },

        authorize: {
            authorizeToken: {
                secured: true,
                key: '/token/authorize',
                method: 'POST',
                handler: 'DefaultAuthorizationProviderController',
                operation: 'authorizeToken',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/authorize',
                }
            },
            authorizeAPIKey: {
                secured: true,
                key: '/apikey/authorize',
                method: 'POST',
                handler: 'DefaultAuthorizationProviderController',
                operation: 'authorizeAPIKey',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/authorize',
                }
            }
        }
    }
};