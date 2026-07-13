/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    kycApi: {
        initKycWorkflow: {
            initMobileKyc: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/mobile/init',
                method: 'POST',
                controller: 'DefaultKycController',
                operation: 'initMobileKyc',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/v0/mobile/init',
                    body: {
                        refId: 'This is unique reference from the source, like loginId, orderId',
                        opsType: 'Required value could be only in [CUST_REG, EMP_REG, ORDER]',
                        description: 'This could have detail description about the KYC model',
                        item: {
                            // complete item detail that represent source information
                            mobileNumber: 'mandate where otp needs to be sent',
                            loginId: 'mandate to identify current user profile',
                            active: 'true/false'
                        },
                        event: {
                            enabled: 'true/false - if any workflow action needs to be triggered towards source system'
                        },
                        sourceDetail: {
                            schemaName: 'Either schema name or index name, in case internal',
                            moduleName: 'Required module name, in case internal',
                            endPoint: {
                                uri: "http://localhost:3000/nodics/profile/employee/authenticate",
                                header: {
                                    entCode: "default",
                                    loginId: "admin",
                                    password: "nodics"
                                },
                                methodName: "POST"
                            }
                        }
                    }
                }
            },
            initEmailKyc: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/email/init',
                method: 'POST',
                controller: 'DefaultKycController',
                operation: 'initEmailKyc',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/v0/email/init',
                    body: {
                        refId: 'This is unique reference from the source, loke loginId, orderId',
                        opsType: 'Required value could be only in [CUST_REG, EMP_REG, ORDER]',
                        description: 'This could have detail description about the KYC model',
                        item: {
                            // complete item detail that represent source information
                            email: 'mandate where otp needs to be sent',
                            loginId: 'mandate to identify current user profile',
                            active: 'true/false'
                        },
                        event: {
                            enabled: 'true/false - if any workflow action needs to be triggered towards source system'
                        },
                        sourceDetail: {
                            schemaName: 'Either schema name or index name, in case internal',
                            moduleName: 'Required module name, in case internal',
                            endPoint: {
                                uri: "http://localhost:3000/nodics/profile/employee/authenticate",
                                header: {
                                    entCode: "default",
                                    loginId: "admin",
                                    password: "nodics"
                                },
                                methodName: "POST"
                            }
                        }
                    }
                }
            }
        },
        validateKycWorkflow: {
            validateMobileKyc: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/mobile/validate',
                method: 'POST',
                controller: 'DefaultKycController',
                operation: 'validateMobileKyc',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/v0/mobile/init',
                    body: {
                        refId: 'This is unique reference from the source, loke loginId, orderId',
                        opsType: 'Required value could be only in [CUST_REG, EMP_REG, ORDER]',
                        otp: {
                            key: 'mobile number',
                            ops: 'customer/employee login id',
                            value: 'otp value'
                        }
                    }
                }
            }
        }
    }
};