/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const csv = require('csvtojson');
const fs = require('fs');
var sizeof = require('object-sizeof');


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

    convertActiveValueToBoolean: function (request, response) {
        return new Promise((resolve, reject) => {
            if (request.models && request.models.length > 0) {
                request.models.forEach(element => {
                    if (element.active !== undefined && typeof element.active !== 'boolean') {
                        element.active = element.active.toLowerCase() == 'true' ? true : false;
                    }
                });
            }
            resolve(true);
        });
    }
};

