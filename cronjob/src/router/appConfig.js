const bodyParser = require('body-parser');

module.exports = {
    cronjob: {
        initSession: function(app) {
            //console.log(' User initSession');
        },
        initLogger: function(app) {
            //console.log(' User initLogger');
        },
        initCache: function(app) {
            //console.log(' User initCache');
        },
        initBodyParser: function(app) {
            console.log(' ===================== CronJob');
        },
        initHeaders: function(app) {
            //console.log(' User initHeaders');
        },
        initErrorRoutes: function(app) {
            //console.log(' User initErrorRoutes');
        },
        initExtras: function(app) {
            //console.log(' User initExtras');
        }
    }
};