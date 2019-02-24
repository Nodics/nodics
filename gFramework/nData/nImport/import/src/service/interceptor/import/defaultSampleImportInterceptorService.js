/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const StreamArray = require('stream-json/streamers/StreamArray');
const path = require('path');
const fs = require('fs');
var sizeof = require('object-sizeof');


module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    handleDefaultImportProcessor: function (options) {
        return new Promise((resolve, reject) => {
            console.log('=============================== >> handleDefaultImportProcessor');
            resolve(true);
        });
    },

    handleEnterpriseImportProcessor: function (options) {
        return new Promise((resolve, reject) => {
            console.log('=============================== >> handleEnterpriseImportProcessor');
            resolve(true);
        });
    },

};