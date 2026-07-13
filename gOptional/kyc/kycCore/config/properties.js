/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    token: {
        OTP: {
            validUpTo: 600, //this value is in secound
            attemptLimit: 5,
            singleUseToken: true
        }
    },
    kyc: {
        responseMapping: {
            default: {
                decision: 'ERROR',
                message: 'Operation facing issue'
            },
            SUC_TKN_00001: {
                decision: 'SUCCESS',
                message: 'Mobile number OTP verified successfully'
            },
            ERR_TKN_00001: {
                decision: 'ERROR',
                message: 'Token expired'
            },
            ERR_TKN_00002: {
                decision: 'ERROR',
                message: 'No token available'
            },
            ERR_TKN_00003: {
                decision: 'RETRY',
                message: 'Invalid token'
            }

        }
    }
};