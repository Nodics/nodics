const facade = require('./bin/facadeGenerator');

module.exports = {
    init: function() {

    },
    loadFacade: function() {
        console.log('=> Starting Facade Generation process');
        facade.init();
    }
};