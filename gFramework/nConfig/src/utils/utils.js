/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

module.exports = {

    isBlank: function (value) {
        return !value || !Object.keys(value).length;
    },

    sortModules: function (rawData) {
        indexedData = rawData.map(a => a.split('.').map(n => +n + 100000).join('.')).sort()
            .map(a => a.split('.').map(n => +n - 100000).join('.'));
        return indexedData;
    },

    sortObject: function (moduleIndex, property) {
        moduleIndex = _.groupBy(moduleIndex, function (element) {
            return parseInt(element[property]);
        });
        return moduleIndex;
    },

    subFolders: function (folder) {
        return fs.readdirSync(folder)
            .filter(subFolder => fs.statSync(path.join(folder, subFolder)).isDirectory())
            .filter(subFolder => subFolder !== 'node_modules' && subFolder !== 'templates' && subFolder[0] !== '.')
            .map(subFolder => path.join(folder, subFolder));
    },

    collectModulesList: function (folder, parent) {
        let metaDataPath = path.join(folder, 'package.json');
        if (fs.existsSync(metaDataPath)) {
            let metaData = require(metaDataPath);
            NODICS.addRawModule(metaData, folder, parent);
            parent = metaData.name;
        }
        for (let subFolder of this.subFolders(folder)) {
            this.collectModulesList(subFolder, parent);
        }
    },

    getAllMethods: function (envScripts) {
        return Object.getOwnPropertyNames(envScripts).filter(function (prop) {
            return typeof envScripts[prop] == 'function';
        });
    },

    getFileNameWithoutExtension: function (filePath) {
        let fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.lastIndexOf("."));
        return fileName.toUpperCaseFirstChar();
    },

    removeDir: function (path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    UTILS.removeDir(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },
};