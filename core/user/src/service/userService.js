module.exports = {
    options: {
        isNew: false
    },

    getFullName: function(inputParam) {
        let response = {};
        DAO.daoName.getByCode(inputParam.req.params.code).then((userModel) => {
            response.success = true;
            response.code = 'SUC001';
            response.msg = 'Finished Successfully';
            response.result = userModel.firstName + ' ' + userModel.lastName;
            inputParam.res.json(response);
        }).catch((err) => {
            response.success = false;
            response.code = 'ERR001';
            response.msg = "Body field can't be null";
            response.error = err;
            inputParam.res.json(response);
        });
    },

    processNodeFirst: function(processRequest, processResponse, process) {
        console.log('.............processNodeFirst');
        process.nextSuccess(processRequest, processResponse);
    },

    processNodeSecond: function(processRequest, processResponse, process) {
        console.log('.............processNodeSecond');
        process.nextSuccess(processRequest, processResponse);
    },

    processNodeThird: function(processRequest, processResponse, process) {
        console.log('.............processNodeThird : ');
        process.nextSuccess(processRequest, processResponse);
    },

    process1NodeSecond: function(processRequest, processResponse, process) {
        console.log('.............process1NodeSecond');
        process.nextSuccess(processRequest, processResponse);
    },

    process1NodeThird: function(processRequest, processResponse, process) {
        console.log('.............process1NodeThird');
        process.nextSuccess(processRequest, processResponse);
        //throw new Error('something bad happened');
    },

    successEnd: function(processRequest, processResponse, process) {
        console.log('.............successEnd');
        //process.success(param, process);
    },

    errorEnd: function(processRequest, processResponse, process) {
        console.log('.............errorEnd');
        //process.success(param, process);
    }
};