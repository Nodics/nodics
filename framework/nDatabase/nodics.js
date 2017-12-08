/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const conHandler = require('./bin/connectionHandler');
const prepareModel = require('./bin/prepareModels');
const schmeaLoader = require('./bin/schemaLoader');

module.exports = {
    init: function() {

    },
    loadDatabase: function() {
        console.log('=> Starting database configuration process');
        conHandler.init();
        //prepareModel.init();
        schmeaLoader.init();
    }
};