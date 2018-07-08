/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    init: function () {
        return new Promise((resolve, reject) => {
            global.PIPELINE = SYSTEM.loadFiles('/src/pipelines/pipelinesDefinition.js');
            resolve(true);
        });
    }
};