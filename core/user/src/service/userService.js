module.exports = {
    options: {
        isNew: false
    },

    getFullName: function(inputParam) {

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