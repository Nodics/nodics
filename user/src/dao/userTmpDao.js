module.exports = {
    options: {
        isNew: true
    },

    getFullName: function(req, res) {
        let response = {};
        let code = req.params.code;

        let database = SYSTEM.getDatabase('user');
        database.models.UserModel.find({ code: code }, function(err, model) {
            if (err) {
                response.msg = err;
                res.json(response);
            } else {
                response.fullName = model.firstName + ' ' + model.lastName;
                res.json(response);
            }
        });
    }
};