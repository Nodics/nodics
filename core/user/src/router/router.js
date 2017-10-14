module.exports = {
    routeUserFullName: function(app) {
        console.log('================================================');
        app.route('/nodics/user/fullname/:code')
            .get(CONTROLLER.UserController.getFullName);
    }
};