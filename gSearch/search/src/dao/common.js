/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    getSearchModel: function (request) {
        request.schemaModel = NODICS.getModels('mdulnm', request.tenant).mdlnm;
        let indexName = request.indexName ? request.indexName : request.schemaModel.indexName;
        if (!request.moduleName || !request.tenant || !indexName) {
            throw new Error('Invalid request or search is not active for this type');
        } else {
            return NODICS.getSearchModel(request.moduleName, request.tenant, indexName);
        }
    },

    doRefresh: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doRefresh(request).then(success => {
                    resolve({
                        success: true,
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
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
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: error
                });
            }
        });
    },

    doExists: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doExists(request).then(success => {
                    resolve({
                        success: true,
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
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
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
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
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
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
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: error
                });
            }
        });
    },


    doBulk: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doBulk(request).then(success => {
                    resolve({
                        success: true,
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
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


    doUpdate: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doUpdate(request).then(success => {
                    resolve({
                        success: true,
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
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
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
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
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: error
                });
            }
        });
    },

    doGetMapping: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doGetMapping(request).then(success => {
                    resolve({
                        success: true,
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: error
                });
            }
        });
    },

    doUpdateMapping: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doUpdateMapping(request).then(success => {
                    resolve({
                        success: true,
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: error
                });
            }
        });
    },

    doRemoveIndex: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                request.searchModel = _self.getSearchModel(request);
                request.searchModel.doRemoveIndex(request).then(success => {
                    resolve({
                        success: true,
                        code: 'SUC_SRCH_00000',
                        result: success
                    });
                }).catch(error => {
                    reject({
                        success: false,
                        code: 'ERR_SRCH_00000',
                        error: error
                    });
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SRCH_00000',
                    error: error
                });
            }
        });
    }
};