const service = require('./bin/serviceBuilder');

module.exports = {
    init: function() {

    },
    loadService: function() {
        console.log('=> Starting Service Generation process');
        service.init();
    }
};