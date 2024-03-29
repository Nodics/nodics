/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const FRAMEWORK = require('./gFramework');

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

    start: function () {
        FRAMEWORK.start();
    },

    genApp: function () {
        FRAMEWORK.genApp();
    },

    genGroup: function () {
        FRAMEWORK.genGroup();
    },

    genModule: function () {
        FRAMEWORK.genModule();
    },

    genReactModule: function () {
        FRAMEWORK.genReactModule();
    },

    genVueModule: function () {
        FRAMEWORK.genVueModule();
    },

    cleanAll: function () {
        FRAMEWORK.cleanAll();
    },

    buildAll: function () {
        FRAMEWORK.buildAll();
    }
};