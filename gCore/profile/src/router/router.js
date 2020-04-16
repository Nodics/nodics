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
            getInternalAuthToken: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/auth/token/:tntCode',
                method: 'GET',
                controller: 'DefaultInternalAuthenticationProviderController',
                operation: 'getInternalAuthToken',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/profile/auth/token/:tntCode',
                    body: {
                        apiKey: 'xxxxxx--xxxx---xxxx---xxxxx'
                    }
                }
            },
            getEnterprise: {
                secured: true,
                accessGroups: ['userGroup'],
                cache: {
                    enabled: false,
                    ttl: 20
                },
                key: '/enterprise/get',
                method: 'GET',
                controller: 'DefaultEnterpriseController',
                operation: 'getEnterprise',
                help: {
                    requestType: 'secured',
                    message: 'entCode need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/profile/enterprise/get',
                }
            },
            getTenants: {
                secured: true,
                accessGroups: ['userGroup'],
                cache: {
                    enabled: true,
                    ttl: 200
                },
                key: '/tenant/get',
                method: 'GET',
                controller: 'DefaultTenantController',
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
                accessGroups: ['userGroup'],
                key: '/employee/authenticate',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'authenticateEmployee',
                help: {
                    requestType: 'secured',
                    message: 'loginId, password and entCode need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/authenticate',
                }
            },
            authenticateCustomer: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/customer/authenticate',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'authenticateCustomer',
                help: {
                    requestType: 'secured',
                    message: 'loginId, password and entCode need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/authenticate',
                }
            }
        },

        authorize: {
            authorizeToken: {
                secured: true,
                accessGroups: ['userGroup'],
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
            }
        }
    }
};