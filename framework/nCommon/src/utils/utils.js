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

    getAllFile: function (pagesPath, fileList) {
        let _self = this;
        if (fs.existsSync(pagesPath)) {
            let files = fs.readdirSync(pagesPath);
            if (files) {
                files.forEach(element => {
                    let file = path.join(pagesPath, element);
                    if (fs.statSync(file).isDirectory()) {
                        _self.getAllFile(file, fileList);
                    } else {
                        let name = element.substring(0, element.lastIndexOf("."));
                        name = name.replace('.', '');
                        fileList[name] = file;
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
            this.getAllFile(pagesPath, fileList);
            return fileList;
        }
    }
}