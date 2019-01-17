/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const initServers = require('./bin/initializeServers');
const serverConfig = require('./bin/loadServerConfiguration');
const registerRouter = require('./bin/registerRouter');
const _ = require('lodash');

module.exports = {
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    cleanAll: function () {

    },

    buildAll: function () {

    },

    loadRouter: function () {
        SYSTEM.LOG.info('Staring servers initialization process');
        return new Promise((resolve, reject) => {
            initServers.init();
            serverConfig.init();
            registerRouter.init().then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });

    }
};