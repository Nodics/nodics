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
            if (model.active && UTILS.isObject(model.active)) {
                let start = model.active.start;
                let end = model.active.end;
                if (start && !(start instanceof Date)) {
                    console.log('converting start date');
                    model.active.start = new Date(start);
                }
                if (end && !(end instanceof Date)) {
                    console.log('converting end date');
                    model.active.end = new Date(end);
                }
                resolve(model);
            } else {
                resolve(model);
            }
        });
    },
};