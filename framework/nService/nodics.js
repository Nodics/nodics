/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const service = require('./bin/serviceBuilder');

module.exports = {
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    genService: function () {
        let _self = this;
        SYSTEM.LOG.info('Starting Service Generation process');
        return service.gen().then(success => { }).catch(error => {
            _self.LOG.error(error);
        });
    },

    loadService: function () {
        let _self = this;
        SYSTEM.LOG.info('Starting Service Generation process');
        return service.loadService().then(success => {
            let statusScript = {};
            SYSTEM.loadFiles('/src/utils/statusDefinitions.js', statusScript);
            SERVICE.DefaultStatusService.loadStatus(statusScript);
        }).catch(error => {
            _self.LOG.error(error);
        });
    }
};