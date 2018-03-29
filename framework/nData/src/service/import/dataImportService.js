/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {

    insertData: function(definition) {
        let models = [];
        _.each(definition.models, (model, name) => {
            models.push(model);
        });
        input = {
            tenant: definition.tenant,
            models: models
        };
        return SERVICE[definition.modelName.toUpperCaseFirstChar() + 'Service'][definition.operation](input);
    },

    importGroup: function(groupName, groupData, tmpGroup) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.insertData(groupData).then(success => {
                if (!UTILS.isBlank(tmpGroup)) {
                    let tmpGroupName = Object.keys(tmpGroup)[0];
                    let tmpGroupData = tmpGroup[tmpGroupName];
                    delete tmpGroup[tmpGroupName];
                    _self.importGroup(tmpGroupName, tmpGroupData, tmpGroup).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    importNextModule: function(moduleName, moduleData, tmpData) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let tmpGroup = _.merge({}, moduleData);
            let groupName = Object.keys(tmpGroup)[0];
            let groupData = tmpGroup[groupName];
            delete tmpGroup[groupName];
            if (NODICS.getModule(moduleName)) {
                _self.importGroup(groupName, groupData, tmpGroup).then(success => {
                    if (!UTILS.isBlank(tmpData)) {
                        let tmpModuleName = Object.keys(tmpData)[0];
                        let tmpModuleData = tmpData[tmpModuleName];
                        delete tmpData[tmpModuleName];
                        _self.importNextModule(tmpModuleName, tmpModuleData, tmpData).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                }).catch(error => {
                    reject(error);
                });
            } else {
                if (!UTILS.isBlank(tmpData)) {
                    let tmpModuleName = Object.keys(tmpData)[0];
                    let tmpModuleData = tmpData[tmpModuleName];
                    delete tmpData[tmpModuleName];
                    _self.importNextModule(tmpModuleName, tmpModuleData, tmpData).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            }
        });
    },

    importData: function(daya) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let moduleName = Object.keys(data)[0];
                let moduleData = data[moduleName];
                delete data[moduleName];
                _self.importNextModule(moduleName, moduleData, data).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    importInitData: function(input, callback) {
        let _self = this;
        let dataType = 'init';
        let data = SERVICE.InternalDataLoadService.loadModules(dataType);
        if (callback) {
            this.importData(data).then(success => {
                callback(null, 'Initial Data imported successfully');
            }).catch(error => {
                callback(error);
            });
        } else {
            return this.importData(dataType);
        }
    },

    importCoreData: function(input, callback) {
        let _self = this;
        let dataType = 'core';
        let data = SERVICE.InternalDataLoadService.loadModules(dataType);
        if (callback) {
            this.importData(data).then(success => {
                callback(null, 'Initial Data imported successfully');
            }).catch(error => {
                callback(error);
            });
        } else {
            return this.importData(dataType);
        }
    },

    importSampleData: function(input, callback) {
        let _self = this;
        let dataType = 'sample';
        let data = SERVICE.InternalDataLoadService.loadModules(dataType);
        if (callback) {
            this.importData(data).then(success => {
                callback(null, 'Initial Data imported successfully');
            }).catch(error => {
                callback(error);
            });
        } else {
            return this.importData(dataType);
        }
    }
};