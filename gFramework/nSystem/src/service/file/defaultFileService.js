/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');

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

    getFileContent: function (request) {
        return new Promise((resolve, reject) => {
            if (!request.type) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invalid request, Type can not be null or empty'));
            } else if (!request.fileName) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invalid request, File name can not be null or empty'));
            } else {
                let filePath = NODICS.getNodicsHome() + '/' + request.path + '/' + request.fileName;
                fs.readFile(filePath, 'utf8', function (error, contents) {
                    if (error) {
                        reject(new CLASSES.NodicsError(error, null, 'ERR_SYS_00000'));
                    } else {
                        resolve({
                            code: 'SUC_SYS_00001',
                            data: contents
                        });
                    }
                });
            }
        });
    },

    downloadFile: function (request) {
        return new Promise((resolve, reject) => {
            if (!request.fileName) {
                reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invalid request, File name can not be null or empty'));
            } else {
                let filePath = NODICS.getNodicsHome() + '/' + request.path + '/' + request.fileName;
                if (fs.existsSync) {
                    resolve({
                        success: true,
                        code: 'SUC_SYS_00001',
                        filePath: filePath
                    });
                } else {
                    reject(new CLASSES.NodicsError('ERR_SYS_00001', 'Invalid request, File name can not be null or empty'));
                }
            }
        });
    }

};