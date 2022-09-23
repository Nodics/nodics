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
            rangeStart: 1000,
            rangeEnd: 9000,
            validUpTo: 300, //this value is in secound
            attemptLimit: 5,
            tokenHandler: 'DefaultOtpHandlerService'
        }
    }
};