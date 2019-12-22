/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {

    removeBody: function (request, response) {
        return new Promise((resolve, reject) => {
            if (response.model && response.model.result && response.model.result.body) {
                delete response.model.result.body;
            }
            resolve(true);
        });
    }
};