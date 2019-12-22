/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {


    checkIfModuleActiveForRouter: function (request, response) {
        return new Promise((resolve, reject) => {
            let moduleName = request.model.moduleName;
            if (moduleName && (moduleName === 'default' || moduleName === 'common' || UTILS.isRouterEnabled(moduleName))) {
                resolve(true);
            } else {
                reject('Invalid moduleName, it should not be null or inactive for routers');
            }
        });
    }
};