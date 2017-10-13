module.exports = {
    get: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.get(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.get(inputParam);
        }
    },
    getById: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.getById(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.getById(inputParam);
        }
    },
    getByCode: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.getByCode(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            SERVICE.ServiceName.getByCode(inputParam);
        }
    },
    save: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.save(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.save(inputParam);
        }
    },
    removeById: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.removeById(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.removeById(inputParam);
        }
    },
    removeByCode: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.removeByCode(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.removeByCode(inputParam);
        }
    },
    update: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.update(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.update(inputParam);
        }
    },
    saveOrUpdate: function(inputParam, callback) {
        if (callback) {
            return SERVICE.ServiceName.saveOrUpdate(inputParam, (error, models, inputParam) => {
                callback(error, models, inputParam);
            });
        } else {
            return SERVICE.ServiceName.saveOrUpdate(inputParam);
        }
    }
};