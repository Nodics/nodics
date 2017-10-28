const controller = require('./bin/controllerGenerator');

module.exports = {
    init: function() {

    },
    loadController: function() {
        console.log('=> Starting Controller Generation process');
        controller.init();
    }
};