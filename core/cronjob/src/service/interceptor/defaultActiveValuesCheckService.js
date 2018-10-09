/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    convertToDate: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (options.model.start && !(options.model.start instanceof Date)) {
                    options.model.start = new Date(options.model.start);
                }
                if (options.model.end && !(options.model.end instanceof Date)) {
                    options.model.end = new Date(options.model.end);
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },
};