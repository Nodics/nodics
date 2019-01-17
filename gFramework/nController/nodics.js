/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const controller = require('./bin/controllerGenerator');

module.exports = {
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    genController: function () {
        let _self = this;
        SYSTEM.LOG.info('Starting Controller Generation process');
        return controller.gen().then(success => { }).catch(error => {
            _self.LOG.error(error);
        });
    },

    loadController: function () {
        let _self = this;
        SYSTEM.LOG.info('Starting Controller Generation process');
        return controller.loadController().then(success => { }).catch(error => {
            _self.LOG.error(error);
        });
    }
};