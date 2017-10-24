const _ = require('lodash');

module.exports = {
    handleResponse: function(error, success, inputParam, callback) {
        let response = {};
        if (error) {
            response.success = false;
            response.code = 'ERR001';
            response.msg = error;
        } else {
            response.success = true;
            response.code = 'SUC001';
            response.msg = 'Finished Successfully';
            response.result = success;
        }
        if (callback) {
            callback(response, inputParam);
        } else {
            inputParam.res.json(response);
        }
    },
    get: function(inputParam, callback) {
        let request = inputParam.req.body || {};
        DAO.daoName.get(request).then((models) => {
            this.handleResponse(null, models, inputParam, callback);
        }).catch((error) => {
            this.handleResponse(error, null, inputParam, callback);
        });
    },
    getById: function(inputParam, callback) {
        let response = {};
        DAO.daoName.getById(inputParam.req.params.id).then((models) => {
            this.handleResponse(null, models, inputParam, callback);
        }).catch((error) => {
            this.handleResponse(error, null, inputParam, callback);
        });
    },
    getByCode: function(inputParam, callback) {
        let response = {};
        DAO.daoName.getByCode(inputParam.req.params.code).then((models) => {
            this.handleResponse(null, models, inputParam, callback);
        }).catch((error) => {
            this.handleResponse(error, null, inputParam, callback);
        });
    },
    save: function(inputParam, callback) {
        let response = {};
        if (!_.isEmpty(inputParam.req.body)) {
            DAO.daoName.save(inputParam.req.body).then((models) => {
                this.handleResponse(null, models, inputParam, callback);
            }).catch((error) => {
                this.handleResponse(error, null, inputParam, callback);
            });
        } else {
            response.success = false;
            response.code = 'ERR001';
            response.msg = "body can't be null";
            if (callback) {
                callback(response, inputParam);
            } else {
                inputParam.res.json(response);
            }
        }
    },
    removeById: function(inputParam, callback) {
        let response = {};
        let ids = [];
        if (inputParam.req.params.id) {
            ids.push(inputParam.req.params.id);
        } else if (inputParam.req.body._id) {
            ids.push(inputParam.req.body._id);
        } else if (inputParam.req.body[0]._id) {
            inputParam.req.body.forEach(function(model) {
                ids.push(model._id);
            });
        } else {
            ids = inputParam.req.body;
        }
        DAO.daoName.removeById(ids).then((models) => {
            this.handleResponse(null, models, inputParam, callback);
        }).catch((error) => {
            this.handleResponse(error, null, inputParam, callback);
        });
    },
    removeByCode: function(inputParam, callback) {
        let response = {};
        let codes = [];
        if (inputParam.req.params.code) {
            codes.push(inputParam.req.params.code);
        } else if (inputParam.req.body.code) {
            codes.push(inputParam.req.body.code);
        } else if (inputParam.req.body[0].code) {
            inputParam.req.body.forEach(function(model) {
                codes.push(model.code);
            });
        } else {
            codes = inputParam.req.body;
        }
        DAO.daoName.removeByCode(codes).then((models) => {
            this.handleResponse(null, models, inputParam, callback);
        }).catch((error) => {
            this.handleResponse(error, null, inputParam, callback);
        });
    },
    update: function(inputParam, callback) {
        let response = {};
        if (inputParam.req.body) {
            DAO.daoName.update(inputParam.req.body).then((models) => {
                this.handleResponse(null, models, inputParam, callback);
            }).catch((error) => {
                this.handleResponse(error, null, inputParam, callback);
            });
        } else {
            response.success = false;
            response.code = 'ERR001';
            response.msg = "body can't be null";
            if (callback) {
                callback(response, inputParam);
            } else {
                inputParam.res.json(response);
            }
        }
    },
    saveOrUpdate: function(inputParam, callback) {
        let response = {};
        if (inputParam.req.body) {
            DAO.daoName.saveOrUpdate(inputParam.req.body).then((models) => {
                this.handleResponse(null, models, inputParam, callback);
            }).catch((error) => {
                this.handleResponse(error, null, inputParam, callback);
            });
        } else {
            response.success = false;
            response.code = 'ERR001';
            response.msg = "body can't be null";
            if (callback) {
                callback(response, inputParam);
            } else {
                inputParam.res.json(response);
            }
        }
    }
};