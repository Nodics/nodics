/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const conHandler = require('./bin/connectionHandler');
const schmeaLoader = require('./bin/schemaLoader');

module.exports = {
    init: function() {

    },
    loadDatabase: function() {
        SYSTEM.LOG.info('=> Starting database configuration process');
        return new Promise((resolve, reject) => {
            conHandler.init().then(success => {
                schmeaLoader.init();
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }
};