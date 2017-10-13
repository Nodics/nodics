module.exports = {
    // This file is common for all DAO Layer router definitions
    //getAll                - /users - get - done
    //getByQuery            - /users - post - done
    //getById               - /user/id/:id - get - done
    //getByCode             - /user/code/:code - get - done

    //updateById            - /user/update/id - post - done
    //updateByCode          - /user/update/code - post - done

    //removeById            - /user/remove/id/:id - delete - done
    //removeByCode          - /user/remove/code/:code - delete - done

    //save                  - /user/save - put - done
    //saveAll               - /user/save - post - done

    //saveOrUpdateById      - /user/id - put - done
    //saveOrUpdateByCode    - /user/code - put - done
    default: {
        bindGettersOperations: function(app) {
            app.route('/contextRoot/modelName')
                .get(CONTROLLER.controllerName.get)
                .post(CONTROLLER.controllerName.get);
            app.route('/contextRoot/modelName/id/:id')
                .get(CONTROLLER.controllerName.getById);
            app.route('/contextRoot/modelName/code/:code')
                .get(CONTROLLER.controllerName.getByCode);
        },

        bindRemoveOperations: function(app) {
            app.route('/contextRoot/modelName/id')
                .delete(CONTROLLER.controllerName.removeById);
            app.route('/contextRoot/modelName/id/:id')
                .delete(CONTROLLER.controllerName.removeById);
            app.route('/contextRoot/modelName/code')
                .delete(CONTROLLER.controllerName.removeByCode);
            app.route('/contextRoot/modelName/code/:code')
                .delete(CONTROLLER.controllerName.removeByCode);

        },

        bindSaveOperations: function(app) {
            app.route('/contextRoot/modelName')
                .put(CONTROLLER.controllerName.save);
        },

        bindUpdateOperations: function(app) {
            app.route('/contextRoot/modelName/update')
                .post(CONTROLLER.controllerName.update);

        },

        bindSaveAndUpdateOperations: function(app) {
            app.route('/contextRoot/modelName/saveOrUpdate')
                .put(CONTROLLER.controllerName.saveOrUpdate);

        }
    }
};