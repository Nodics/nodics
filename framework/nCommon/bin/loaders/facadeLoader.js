var _ = require('lodash');

module.exports = {
    loadFacades: function(module) {
        console.log('   INFO: Loading all module facades');
        let path = module.path + '/src/facade';
        SYSTEM.processFiles(path, "Facade.js", (file) => {
            let facadeName = SYSTEM.getFileNameWithoutExtension(file);
            if (FACADE[facadeName]) {
                FACADE[facadeName] = _.merge(FACADE[facadeName], require(file));
            } else {
                let facadeObject = require(file);
                if (facadeObject.options.isNew) {
                    FACADE[facadeName] = facadeObject;
                } else {
                    console.warn('   WARNING: Facade container doesn,t contain ' + facadeName + ' and isNew Property is false. hence ignoring file ', file);
                }
            }
        });
    }
};