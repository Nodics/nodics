/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    initMobileKyc: function (request, response) {
        let data = {
            "workflowCode": "mobileNumberValidationWorkflowHead",
            "carrier": {
                "code": "mobile_Validation_Workflow_Carrier22",
                "sourceDetail": {
                    "schemaName": "customer",
                    "moduleName": "profile"
                },
                "event": {
                    "enabled": false
                }
            },
            "items": [
                {
                    "code": "externalItemOne",
                    "refId": "externalItemOne",
                    "active": true,
                    "name": "externalItemOne",
                    "address": {
                        "addr": "BTM Layout",
                        "city": "Bangalore"
                    },
                    "callbackData": {
                        "message": "general message"
                    }
                }
            ]
        };
        return new Promise((resolve, reject) => {
            resolve({
                decision: 'INITIATE',
                feedback: {
                    message: 'Mobile number OTP verification initiated'
                }
            });
        });
    }
};