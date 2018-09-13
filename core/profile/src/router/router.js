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
            getEnterprise: {
                secured: true,
                cache: {
                    enabled: false,
                    ttl: 20
                },
                key: '/enterprise/get',
                method: 'POST',
                handler: 'DefaultEnterpriseController',
                operation: 'getEnterprise',
                help: {
                    requestType: 'secured',
                    message: 'enterpriseCode need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/profile/enterprise/get',
                }
            },
            getTenants: {
                secured: false,
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
            authorize: {
                secured: true,
                key: '/employee/authorize',
                method: 'POST',
                handler: 'DefaultAuthenticationProviderController',
                operation: 'authorize',
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