/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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
            NODICS.LOG.error("System initialization error: configuration initializer failure.");
            process.exit(1);
        }

        NODICS.LOG.info('Starting Utils loader process');
        NODICS.loadFiles('/src/utils/utils.js', global.UTILS);

        NODICS.LOG.info('Starting Enums loader process');
        NODICS.loadEnums();

    },

    start: function () {
        this.common();

        NODICS.LOG.info('Staring Classes loader process');
        NODICS.loadClasses();
    },

    cleanAll: function () {
        this.common();
        NODICS.cleanModules();
    },

    buildAll: function () {
        this.common();
    },


};