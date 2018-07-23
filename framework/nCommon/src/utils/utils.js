/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

module.exports = {
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

    getAllHeaderFiles: function (filePath, fileList) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.forEach(element => {
                    let file = path.join(filePath, element);
                    if (fs.statSync(file).isDirectory()) {
                        _self.getAllHeaderFiles(file, fileList);
                    } else {
                        let name = element.substring(0, element.lastIndexOf("."));
                        name = name.replace(/\./g, '');
                        if (!UTILS.isBlank(name) && name.endsWith('Header')) {
                            fileList[name] = file;
                        }
                    }
                });
            }
        }
    },

    getAllDataFiles: function (filePath, fileList) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.forEach(element => {
                    let file = path.join(filePath, element);
                    if (fs.statSync(file).isDirectory()) {
                        _self.getAllDataFiles(file, fileList);
                    } else {
                        let name = element.substring(0, element.lastIndexOf("."));
                        name = name.replace(/\./g, '');
                        if (!UTILS.isBlank(name) && !name.endsWith('Header')) {
                            fileList[name] = file;
                        }
                    }
                });
            }
        }
    },

    getAllFrefixFiles: function (filePath, fileList, preFix) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.forEach(element => {
                    let file = path.join(filePath, element);
                    if (fs.statSync(file).isDirectory()) {
                        _self.getAllFrefixFiles(file, fileList, preFix);
                    } else {
                        let name = element.substring(0, element.lastIndexOf("."));
                        name = name.replace(/\./g, '');
                        if (!UTILS.isBlank(name)) {
                            if (!preFix || element.startsWith(preFix)) {
                                fileList[name] = file;
                            }
                        }
                    }
                });
            }
        }
    },

    getAllPostFixFiles: function (filePath, fileList, postFix) {
        let _self = this;
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.forEach(element => {
                    let file = path.join(filePath, element);
                    if (fs.statSync(file).isDirectory()) {
                        _self.getAllPostFixFiles(file, fileList, postFix);
                    } else {
                        let name = element.substring(0, element.lastIndexOf("."));
                        name = name.replace(/\./g, '');
                        if (!UTILS.isBlank(name)) {
                            if (!postFix || element.endsWith(postFix)) {
                                fileList[name] = file;
                            }
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
    }
}