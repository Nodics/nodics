/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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