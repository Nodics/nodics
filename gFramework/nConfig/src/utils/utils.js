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

    subFolders: function (folder) {
        return fs.readdirSync(folder)
            .filter(subFolder => fs.statSync(path.join(folder, subFolder)).isDirectory())
            .filter(subFolder => subFolder !== 'node_modules' && subFolder !== 'templates' && subFolder[0] !== '.')
            .map(subFolder => path.join(folder, subFolder));
    },

    collectModulesList: function (folder, modulePathList) {
        const hasPackageJson = fs.existsSync(path.join(folder, 'package.json'));
        if (hasPackageJson) {
            modulePathList.push(folder);
        }
        for (let subFolder of this.subFolders(folder)) {
            this.collectModulesList(subFolder, modulePathList);
            /*
                if (!subFolder.endsWith(NODICS.getActiveApplication())) {
                    this.collectModulesList(subFolder, modulePathList);
                }
            */
        }
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
};