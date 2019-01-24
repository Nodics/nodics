/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    doExists: function (request) {
        return new Promise((resolve, reject) => {
            request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
            try {
                request.searchModel = SERVICE.DefaultSearchConfigurationService.getSearchModel(request.collection);
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
        return new Promise((resolve, reject) => {
            request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
            try {
                request.searchModel = SERVICE.DefaultSearchConfigurationService.getSearchModel(request.collection);
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
        return new Promise((resolve, reject) => {
            request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
            try {
                request.searchModel = SERVICE.DefaultSearchConfigurationService.getSearchModel(request.collection);
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
        return new Promise((resolve, reject) => {
            request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
            try {
                request.searchModel = SERVICE.DefaultSearchConfigurationService.getSearchModel(request.collection);
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
        return new Promise((resolve, reject) => {
            request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
            try {
                request.searchModel = SERVICE.DefaultSearchConfigurationService.getSearchModel(request.collection);
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
        return new Promise((resolve, reject) => {
            request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
            try {
                request.searchModel = SERVICE.DefaultSearchConfigurationService.getSearchModel(request.collection);
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
        return new Promise((resolve, reject) => {
            request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
            try {
                request.searchModel = SERVICE.DefaultSearchConfigurationService.getSearchModel(request.collection);
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
        return new Promise((resolve, reject) => {
            request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
            try {
                request.searchModel = SERVICE.DefaultSearchConfigurationService.getSearchModel(request.collection);
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
        return new Promise((resolve, reject) => {
            request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
            try {
                request.searchModel = SERVICE.DefaultSearchConfigurationService.getSearchModel(request.collection);
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
        return new Promise((resolve, reject) => {
            request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
            try {
                request.searchModel = SERVICE.DefaultSearchConfigurationService.getSearchModel(request.collection);
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