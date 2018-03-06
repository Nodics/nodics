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
        input = {
            tenant: definition.tenant,
            models: definition.data
        };
        if (definition.operation === 'save') {
            return SERVICE[definition.modelName.toUpperCaseFirstChar() + 'Service'].save(input);
        } else if (definition.operation === 'update') {
            return SERVICE[definition.modelName.toUpperCaseFirstChar() + 'Service'].update(input);
        } else if (definition.operation === 'saveOrUpdate') {
            return SERVICE[definition.modelName.toUpperCaseFirstChar() + 'Service'].saveOrUpdate(input);
        }
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
        });
    },

    importData: function(data) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let tmpData = _.merge({}, data);
                let moduleName = Object.keys(tmpData)[0];
                let moduleData = tmpData[moduleName];
                delete tmpData[moduleName];
                _self.importNextModule(moduleName, moduleData, tmpData).then(success => {
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
        if (!UTILS.isBlank(DATA.init)) {
            if (callback) {
                _self.importData(DATA.init).then(success => {
                    callback(null, 'Initial Data imported successfully');
                }).catch(error => {
                    callback(error);
                });
            } else {
                return _self.importData(DATA.init);
            }
        } else {
            if (callback) {
                callback('There is no Initial data available to import');
            } else {
                return Promise.reject('There is no Initial data available to import');
            }
        }
    },

    importCoreData: function(input, callback) {
        let _self = this;
        if (!UTILS.isBlank(DATA.core)) {
            if (callback) {
                _self.importData(DATA.core).then(success => {
                    callback(null, 'Core Data imported successfully');
                }).catch(error => {
                    callback(error);
                });
            } else {
                return _self.importData(DATA.core);
            }
        } else {
            if (callback) {
                callback('There is no core data available to import');
            } else {
                return Promise.reject('There is no core data available to import');
            }
        }
    },

    importSampleData: function(input, callback) {
        let _self = this;
        if (!UTILS.isBlank(DATA.sample)) {
            if (callback) {
                _self.importData(DATA.sample).then(success => {
                    callback(null, 'Sample Data imported successfully');
                }).catch(error => {
                    callback(error);
                });
            } else {
                return _self.importData(DATA.sample);
            }
        } else {
            if (callback) {
                callback('There is no sample data available to import');
            } else {
                return Promise.reject('There is no sample data available to import');
            }
        }
    }
};