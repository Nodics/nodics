/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    setUpdatedTimestamp: function (request, response) {
        return new Promise((resolve, reject) => {
            if (request.model) {
                request.model.updated = new Date();
            }
            resolve(true);
        });
    },


    blockNTest: function (request, response) {
        return new Promise((resolve, reject) => {
            if (NODICS.isNTestRunning()) {
                reject(new CLASSES.NodicsError('ERR_TNT_00005', 'Save operation not allowed, while running N-Test cases'));
            } else {
                resolve(true);
            }
        });
    }
};