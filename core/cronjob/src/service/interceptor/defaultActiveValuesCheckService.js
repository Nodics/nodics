/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    convertToDate: function (model, options) {
        return new Promise((resolve, reject) => {
            try {
                if (model.start && !(model.start instanceof Date)) {
                    model.start = new Date(model.start);
                }
                if (model.end && !(model.end instanceof Date)) {
                    model.end = new Date(model.end);
                }
                resolve(model);
            } catch (error) {
                reject(error);
            }
        });
    },
};