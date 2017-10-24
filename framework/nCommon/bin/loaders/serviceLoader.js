var _ = require('lodash');

module.exports = {
    loadServices: function(module) {
        console.log('   INFO: Loading all module services');
        let path = module.path + '/src/service';
        SYSTEM.processFiles(path, "Service.js", (file) => {
            let serviceName = SYSTEM.getFileNameWithoutExtension(file);
            if (SERVICE[serviceName]) {
                SERVICE[serviceName] = _.merge(SERVICE[serviceName], require(file));
            } else {
                let serviceObject = require(file);
                if (serviceObject.options.isNew) {
                    SERVICE[serviceName] = serviceObject;
                } else {
                    console.warn('   WARNING: ModelService container doesn,t contain ' + serviceName + ' and isNew Property is false. hence ignoring file ', file);
                }
            }
        });
    }
};