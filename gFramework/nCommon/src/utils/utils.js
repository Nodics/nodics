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
const uuid = require('uuid');

// const uuidv4 = require('uuid').v4();
// const uuidv5 = require('uuid').v5();


/**
 * @module nCommon/utils/utils
 * @description Shared utility contributions for identifiers, password hashing, recursive file discovery, trusted script evaluation, error normalization, and inherited user-group access resolution.
 * @layer utility
 * @owner nCommon
 * @override Later modules may merge additional utilities or override named functions through the layered utility loader. Security-sensitive replacements must preserve password hashing, error traceability, and recursive group behavior.
 */
module.exports = {
    /**
     * Generates a random UUID v4 identifier.
     * @returns {string} Unique identifier.
     */
    generateUniqueCode: function () {
        return uuid.v4();
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
        return uuid.v5(key, uuid.v5.URL);
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

    /**
     * Hashes a password using a generated bcrypt salt.
     * @param {string} password Plain-text password.
     * @returns {Promise<string>} Password hash.
     */
    encryptPassword: function (password) {
        return new Promise((resolve, reject) => {
            UTILS.generatePasswordHash(password).then(hash => {
                resolve(hash);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**
     * Compares a plain value with a bcrypt hash.
     * @param {string} value Plain value.
     * @param {string} hash Existing bcrypt hash.
     * @returns {Promise<boolean>} Whether the value matches.
     */
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

    /**
     * Executes every function-valued property on an object.
     * @param {Object<string,Function>} object Function collection.
     * @param {*} [param] Optional argument supplied to each function.
     * @returns {void}
     * @sideEffects Invokes contributed functions synchronously.
     */
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

    /**
     * Recursively discovers import header files and optionally moves them to processing.
     * @param {string} filePath Directory to scan.
     * @param {Object<string,string>} fileList Mutable header-name to path map.
     * @param {number} [limit] Optional maximum number of files.
     * @param {boolean} [moveProcessing] Move discovered files through the file handler.
     * @returns {void}
     */
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

    /**
     * Recursively discovers non-header data files.
     * @param {string} filePath Directory to scan.
     * @param {Object<string,string>} fileList Mutable basename/extension to path map.
     * @returns {void}
     */
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

    /**
     * Recursively indexes all named files beneath a directory.
     * @param {string} filePath Directory to scan.
     * @param {Object<string,string>} fileList Mutable normalized-name to path map.
     * @returns {void}
     */
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

    /**
     * Evaluates a trusted configured script with request and response in lexical scope.
     * @param {Object} request Nodics request context.
     * @param {Object} response Nodics response context.
     * @param {string} script Trusted script expression.
     * @returns {Promise<boolean>} Resolves for a truthy result and rejects otherwise.
     * @throws Rejects syntax and runtime errors. Never pass untrusted user input as `script`.
     */
    evaluateScript: function (request, response, script) {
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

    /**
     * Normalizes an Error into the legacy Nodics response shape.
     * @param {Error} error Source error.
     * @param {string} [message] Additional context.
     * @param {string} defaultCode Fallback status definition code.
     * @returns {Object} Serializable error response including stack.
     */
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

    /**
     * Normalizes a message into the legacy Nodics response shape.
     * @param {string|Object} error Message or error payload.
     * @param {string} defaultCode Status definition code.
     * @returns {Object} Serializable error response.
     */
    extractFromMessage: function (error, defaultCode) {
        return {
            code: defaultCode,
            responseCode: SERVICE.DefaultStatusService.get(defaultCode).code,
            message: error
        };
    },

    /**
     * Flattens user-group codes across nested parent-group relationships.
     * @param {Array<Object|string>} userGroups Group objects or codes.
     * @param {string[]} [codes] Mutable result accumulator.
     * @returns {string[]} Effective group codes.
     */
    getUserGroupCodes: function (userGroups, codes = [], visited = []) {
        let _self = this;
        if (userGroups && userGroups.length > 0) {
            userGroups.forEach(userGroup => {
                if (UTILS.isObject(userGroup)) {
                    if (userGroup.active === false || visited.includes(userGroup.code)) return;
                    visited.push(userGroup.code);
                    if (!codes.includes(userGroup.code)) {
                        codes.push(userGroup.code);
                    }
                    if (userGroup.parentGroups) {
                        _self.getUserGroupCodes(userGroup.parentGroups, codes, visited);
                    }
                } else {
                    if (!codes.includes(userGroup)) codes.push(userGroup);
                }
            });
        }
        return codes;
    },

    /**
     * Flattens unique permissions across nested parent-group relationships.
     * @param {Object[]} userGroups Group objects containing permissions and optional parents.
     * @param {string[]} [permissions] Mutable result accumulator.
     * @returns {string[]} Effective inherited permissions.
     */
    getUserGroupPermissions: function (userGroups, permissions = [], visited = []) {
        let _self = this;
        if (userGroups && userGroups.length > 0) {
            userGroups.forEach(userGroup => {
                if (UTILS.isObject(userGroup)) {
                    if (userGroup.active === false || visited.includes(userGroup.code)) return;
                    visited.push(userGroup.code);
                    if (Array.isArray(userGroup.permissions)) {
                        userGroup.permissions.forEach(permission => {
                            if (!permissions.includes(permission)) {
                                permissions.push(permission);
                            }
                        });
                    }
                    if (userGroup.parentGroups) {
                        _self.getUserGroupPermissions(userGroup.parentGroups, permissions, visited);
                    }
                }
            });
        }
        return permissions;
    }
};
