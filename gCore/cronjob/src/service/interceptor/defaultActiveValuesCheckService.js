/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    convertToDate: function (request, response) {
        return new Promise((resolve, reject) => {
            try {
                if (request.model.start && !(request.model.start instanceof Date)) {
                    request.model.start = new Date(request.model.start);
                }
                if (request.model.end && !(request.model.end instanceof Date)) {
                    request.model.end = new Date(request.model.end);
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },
};