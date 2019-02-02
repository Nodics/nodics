/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const infra = require('./bin/infra');


module.exports = {
    /**
    * This function is used to initiate module loading process. If there is any functionalities, required to be executed on module loading. 
    * defined it that with Promise way
    * @param {*} options 
    */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize module loading process. If there is any functionalities, required to be executed after module loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },






    common: function () {
        if (!CONFIG || !SYSTEM || !NODICS) {
            SYSTEM.LOG.error("System initialization error: configuration initializer failure.");
            process.exit(1);
        }

        SYSTEM.LOG.info('Starting Utils loader process');
        SYSTEM.loadFiles('/src/utils/utils.js', global.UTILS);

        SYSTEM.LOG.info('Starting Enums loader process');
        SYSTEM.loadEnums();

    },

    start: function () {
        this.common();

        SYSTEM.LOG.info('Staring Classes loader process');
        SYSTEM.loadClasses();
    },

    cleanAll: function () {
        this.common();
        SYSTEM.cleanModules();
    },

    buildAll: function () {
        this.common();
    },


};