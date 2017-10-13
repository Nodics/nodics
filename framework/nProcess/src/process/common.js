module.exports = {
    handleErrorEnd: function(processRequest, processResponse) {
        console.log('............. handleErrorEnd : ');
        if (processResponse.errors) {
            console.log(processResponse.errors);
        }
    },

    handleSucessEnd: function(processRequest, processResponse) {
        console.log('............. handleSucessEnd');
    },

    handleFailureEnd: function(processRequest, processResponse) {
        console.log('............. handleFailureEnd');
    }
}