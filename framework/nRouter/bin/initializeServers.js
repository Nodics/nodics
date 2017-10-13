const fs = require('fs');

module.exports = {
    init: function() {
        Object.keys(API).forEach(function(moduleName) {
            let moduleAPI = API[moduleName];
            if (moduleAPI.metaData &&
                moduleAPI.metaData.publish) {
                console.log('### Initializing API Service for module : ', moduleName);
                moduleAPI.app = require('express')();
            }
        });
    }
}