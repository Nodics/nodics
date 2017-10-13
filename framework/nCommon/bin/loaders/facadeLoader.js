var _ = require('lodash');

module.exports = {
    loadFacades: function(module) {
        console.log('#### Staring process to load Facades for Module : ', module.name);
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
                    console.warn('Facade container doesn,t contain ' + facadeName + ' and isNew Property is false. hence ignoring file ', file);
                }
            }
        });
    }
}