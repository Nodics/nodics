/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const daoGenerator = require('./bin/daoGenerator');

module.exports = {
    init: function() {

    },

    loadDao: function() {
        let _self = this;
        SYSTEM.LOG.info('Starting Dao generation process.');
        return daoGenerator.init().then(success => {}).catch(error => {
            _self.LOG.error(error);
        });
    }
};