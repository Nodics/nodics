var _ = require('lodash');

module.exports = {
    loadControllers: function(module) {
        console.log('#### Staring process to load Controllers for Module : ', module.name);
        let path = module.path + '/src/controller';
        SYSTEM.processFiles(path, "Controller.js", (file) => {
            let controllerName = SYSTEM.getFileNameWithoutExtension(file);
            if (CONTROLLER[controllerName]) {
                CONTROLLER[controllerName] = _.merge(CONTROLLER[controllerName], require(file));
            } else {
                let controllerObject = require(file);
                if (controllerObject.options.isNew) {
                    CONTROLLER[controllerName] = controllerObject;
                } else {
                    console.warn('Controller container doesn,t contain ' + controllerName + ' and isNew Property is false. hence ignoring file ', file);
                }
            }
        });
    }
}