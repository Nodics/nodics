/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    getSearchModel: function (request) {
        request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
        let moduleName = collection ? collection.moduleName : request.moduleName;
        let tenant = collection ? collection.tenant : request.tenant;
        let typeName = collection ? collection.typeName : request.typeName;
        if (!moduleName || !tenant || !typeName) {
            throw new Error('Invalid request or search is not active for this type');
        } else {
            return NODICS.getSearchModel(moduleName, tenant)[typeName];
        }
    },

    doExists: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doExists(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    doCheckHealth: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doCheckHealth(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    doGet: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doGet(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    doSearch: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doSearch(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    doSave: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doSave(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    doRemove: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doRemove(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    doRemoveByQuery: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doRemoveByQuery(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    getMapping: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.getMapping(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    updateMapping: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.updateMapping(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    removeType: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.removeType(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    fullIndex: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.removeType(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    },

    incrementalIndex: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.removeType(request).then(success => {
                    resolve({
                        success: true,
                        code: '',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: '',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: '',
                    error: error
                });
            }
        });
    }
};