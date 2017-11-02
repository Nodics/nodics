const dao = require('./loaders/daoLoader');
const service = require('./loaders/serviceLoader');
const processDefinition = require('./loaders/processDefinitionLoader');
const facade = require('./loaders/facadeLoader');
const controller = require('./loaders/controllerLoader');
const router = require('./loaders/routerLoader');
const test = require('./loaders/testLoader');

module.exports = {
    init: function() {
        console.log('=> Staring process to load Modules');
        let _self = this;
        let moduleIndex = CONFIG.get('moduleIndex');
        Object.keys(moduleIndex).forEach(function(key) {
            var value = moduleIndex[key][0];
            _self.loadModule(value);
        });
    },

    loadModule: function(module) {
        console.log(' =>Staring process for module : ', module.name);
        dao.loadDao(module);
        service.loadServices(module);
        processDefinition.loadProcessDefinition(module);
        facade.loadFacades(module);
        controller.loadControllers(module);
        test.loadTest(module);

        let moduleFile = require(module.path + '/nodics.js');
        if (moduleFile.init) {
            moduleFile.init();
        }
    }
};