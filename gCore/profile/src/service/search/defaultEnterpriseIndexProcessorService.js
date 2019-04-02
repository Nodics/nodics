/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

*/

const _ = require('lodash');
module.exports = {

    enterpriseIndexProcessor: function (request) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('DefaultEnterpriseIndexProcessorService.enterpriseIndexProcessor');
            //let newModel = _.merge({}, request.models[0]);
            //newModel.code = 'NewDefault';
            //request.models.push(newModel);
            resolve(true);
        });
    }
};