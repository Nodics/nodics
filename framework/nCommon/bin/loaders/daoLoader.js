var _ = require('lodash');

module.exports = {
    loadDao: function(module) {
        console.log('#### Staring process to load DAO for Module : ', module.name);
        let path = module.path + '/src/dao';
        SYSTEM.processFiles(path, "Dao.js", (file) => {
            let daoName = SYSTEM.getFileNameWithoutExtension(file);
            if (DAO[daoName]) {
                DAO[daoName] = _.merge(DAO[daoName], require(file));
            } else {
                let doaObject = require(file);
                if (doaObject.options.isNew) {
                    DAO[daoName] = doaObject;
                } else {
                    console.warn('Dao container doesn,t contain ' + daoName + ' and isNew Property is false. hence ignoring file ', file);
                }
            }
        });
    }
}