/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');

module.exports = {

    /* ------------------------------------------------ */
    loadModules: function (dataType) {
        let _self = this;
        let data = {};
        Object.keys(NODICS.getIndexedModules()).forEach(function (key) {
            var value = NODICS.getIndexedModules()[key][0];
            let path = value.path + '/data/dataConfig.js';
            if (fs.existsSync(path)) {
                let file = require(path);
                let dataObject = file[dataType];
                if (dataObject) {
                    if (dataObject instanceof Array) {
                        _self.loadFiles(dataObject, value, dataType, data);
                    } else {
                        _self.loadFiles(dataObject.common, value, dataType, data);
                        _self.loadFiles(dataObject[NODICS.getActiveEnvironment()], value, dataType, data);
                    }
                }
            }
        });
        return data;
    },

    loadFiles: function (list, module, dataType, data) {
        let _self = this;
        if (list.length > 0) {
            list.forEach(file => {
                if (!file.startsWith('/')) {
                    file = '/' + file;
                }
                let filePath = module.path + '/data/' + dataType + file;
                _self.loadData(filePath, data);
            });
        }
    },

    loadData: function (file, data) {
        let coreDataFile = require(file);
        _.each(coreDataFile, (value, moduleName) => {
            if (data[moduleName]) {
                _.merge(data[moduleName], value);
            } else {
                data[moduleName] = value;
            }
        });
    }
};