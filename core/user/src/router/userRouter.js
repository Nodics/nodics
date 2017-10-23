module.exports = {
    routeUserFullName: function(app) {
        app.route('/nodics/user/fullname/:code')
            .get(CONTROLLER.UserController.getFullName);
    }
};