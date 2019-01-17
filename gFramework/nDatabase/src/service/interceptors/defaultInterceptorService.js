/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    setUpdatedTimestamp: function (options) {
        return new Promise((resolve, reject) => {
            if (options.model) {
                options.model.updated = new Date();
            }
            resolve(true);
        });
    },


    blockNTest: function (options) {
        return new Promise((resolve, reject) => {
            if (NODICS.isNTestRunning()) {
                reject('Save operation not allowed, while running N-Test cases');
            } else {
                resolve(true);
            }
        });
    }
};