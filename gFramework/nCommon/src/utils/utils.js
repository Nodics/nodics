/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');
const bcrypt = require("bcryptjs");
const uuidv5 = require('uuid/v5');
const uuidv4 = require('uuid/v4');

module.exports = {
    generateUniqueCode: function () {
        return uuidv4();
    },

    /**
     * generates random string of characters i.e salt
     * @function
     * @param {number} length - Length of the random string.
     */
    generateSalt: function (length) {
        return bcrypt.genSaltSync(length || CONFIG.get('encryptSaltLength') || 10);
    },

    /**
     * Generate Unique Hash
     */
    generateHash: function (key) {
        return uuidv5(key, uuidv5.URL);
    },

    /**
     * hash password with sha512.
     * @function
     * @param {string} value - List of required fields.
     * @param {string} salt - Data to be validated.
     */
    generatePasswordHash: function (value, salt) {
        return new Promise((resolve, reject) => {
            try {
                salt = salt || UTILS.generateSalt();
                bcrypt.hash(value, salt).then(function (hash) {
                    resolve(hash);
                });
            } catch (err) {
                reject(err);
            }
        });
    },

    encryptPassword: function (password) {
        return new Promise((resolve, reject) => {
            UTILS.generatePasswordHash(password).then(hash => {
                resolve(hash);
            }).catch(error => {
                reject(err);
            });
        });
    },

    compareHash: function (value, hash) {
        return new Promise((resolve, reject) => {
            try {
                bcrypt.compare(value, hash).then(function (match) {
                    resolve(match);
                });
            } catch (err) {
                reject(err);
            }
        });
    },

    executeFunctions: function (object, param) {
        if (object) {
            Object.keys(object).forEach(function (key) {
                let instance = object[key];
                if (instance && typeof instance === "function") {
                    if (param) {
                        instance(param);
                    } else {
                        instance();
                    }
                }
            });
        }
    },

    getHeaderFiles: function (filePath, fileList, limit, moveProcessing) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.forEach(element => {
                    let file = path.join(filePath, element);
                    if (fs.statSync(file).isDirectory()) {
                        _self.getHeaderFiles(file, fileList);
                    } else {
                        let name = element.substring(0, element.lastIndexOf("."));
                        name = name.replace(/\./g, '');
                        if (!UTILS.isBlank(name) && (name.endsWith('Header') || name.endsWith('Headers'))) {
                            if (moveProcessing) {
                                fileList[name] = SERVICE.DefaultFileHandlerService.moveSyncToProcessing(file);
                            } else {
                                fileList[name] = file;
                            }
                            if (limit && limit > 0 && Object.keys(fileList).length >= limit) {
                                return false;
                            }
                        }
                    }
                });
            }
        }
    },

    getDataFiles: function (filePath, fileList) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.forEach(element => {
                    let file = path.join(filePath, element);
                    if (fs.statSync(file).isDirectory()) {
                        _self.getDataFiles(file, fileList);
                    } else {
                        let name = element.split('.').shift();
                        let extname = element.split('.').pop();
                        if (!UTILS.isBlank(name) && !name.endsWith('Header') && !name.endsWith('Headers')) {
                            fileList[name + '_' + extname] = file;
                        }
                    }
                });
            }
        }
    },

    getAllFiles: function (filePath, fileList) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.forEach(element => {
                    let file = path.join(filePath, element);
                    if (fs.statSync(file).isDirectory()) {
                        _self.getAllFiles(file, fileList);
                    } else {
                        let name = element.substring(0, element.lastIndexOf("."));
                        name = name.replace(/\./g, '');
                        if (!UTILS.isBlank(name)) {
                            fileList[name] = file;
                        }
                    }
                });
            }
        }
    },

    getPages: function (moduleName) {
        let moduleObject = NODICS.getRawModule(moduleName);
        let webPath = moduleObject.path + '/' + CONFIG.get('webRootDirName');
        let pagesPath = webPath + '/pages';
        if (fs.existsSync(webPath) && fs.existsSync(pagesPath)) {
            let fileList = {};
            this.getAllFiles(pagesPath, fileList);
            return fileList;
        }
    },

    evaluateScript: function (request, responce, script) {
        return new Promise((resolve, reject) => {
            try {
                let result = eval(script);
                if (result) {
                    resolve(true);
                } else {
                    reject(false);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    extractFromError: function (error, message, defaultCode) {
        let errMsg = error.message || SERVICE.DefaultStatusService.get(defaultCode).message;
        if (message) errMsg = errMsg + ' : ' + message;
        errMsg = errMsg + ' : ' + error.message;
        return {
            code: defaultCode,
            name: error.name,
            responseCode: SERVICE.DefaultStatusService.get(defaultCode).code,
            message: errMsg,
            stack: error.stack
        };
    },

    extractFromMessage: function (error, defaultCode) {
        return {
            code: defaultCode,
            responseCode: SERVICE.DefaultStatusService.get(defaultCode).code,
            message: error
        };
    }
};