const bodyParser = require('body-parser');

module.exports = {
    initProperties: function(app) {
        //console.log(' Default initProperties');
    },
    initSession: function(app) {
        //console.log(' Default initSession');
    },
    initLogger: function(app) {
        //console.log(' Default initLogger');
    },
    initCache: function(app) {
        //console.log(' Default initCache');
    },
    initBodyParser: function(app) {
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
    },
    initHeaders: function(app) {
        //console.log(' Default initHeaders');
    },
    initErrorRoutes: function(app) {
        //console.log(' Default initErrorRoutes'); 
    },
    initExtras: function(app) {
        //console.log(' Default initExtras');
    }
};