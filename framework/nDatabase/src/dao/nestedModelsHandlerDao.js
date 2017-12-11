const _ = require('lodash');

module.exports = {

    options: {
        isNew: true
    },
    /*
        request.tenant
        request.models
        request.rawSchema
    */
    saveNestedSchema: function(request, callback) {
        if (request.models instanceof Array) {
            model = request.models.shift();
            DAO.NestedModelsHandlerDao.saveSubModel(model, [], request.models, request, callback);
        } else {
            DAO.NestedModelsHandlerDao.saveSubModel(request.models, [], [], request, callback);
        }
    },
    //call this function only if sub schema is there
    saveSubModel: function(model, resoledModels, models, request, callback) {
        _.each(request.rawSchema.refSchema, (ref, property) => {
            if (!UTILS.isBlank(model[property])) {
                let subModel = model[property];
                let input = {
                    tenant: request.tenant,
                    models: subModel
                };
                NODICS.getModels(request.rawSchema.moduleName, request.tenant)[ref.modelName].save(input, (error, result) => {
                    console.log(' Model Saved ', error);
                    if (error) {
                        throw new Error(error);
                    } else {
                        let ids = [];
                        result.forEach((response) => {
                            ids.push(response._id);
                        });
                        if (ref.type === 'many') {
                            model[property] = ids;
                        } else {
                            model[property] = ids[0];
                        }
                        resoledModels.push(model);
                    }
                    if (models.length > 0) {
                        model = models.shift();
                        DAO.NestedModelsHandlerDao.saveSubModel(model, resoledModels, models, request, callback);
                    } else {
                        request.input.models = resoledModels;
                        callback(request.input, request.callback);
                    }
                });
            }
        });
    }
};