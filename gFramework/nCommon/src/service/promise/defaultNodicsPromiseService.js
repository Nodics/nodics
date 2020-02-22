/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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

    all: function (promises, response = {}) {
        return new Promise((resolve, reject) => {
            if (promises && promises.length > 0) {
                let ops = promises.shift();
                Promise.all([ops]).then(success => {
                    if (!response.success) response.success = [];
                    response.success = response.success.concat(success);
                    nodicsPromise(promises, response).then(response => {
                        resolve(response);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    if (!response.errors) response.errors = [];
                    response.errors.push(error);
                    nodicsPromise(promises, response).then(response => {
                        resolve(response);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                resolve(response);
            }
        });
    }
};