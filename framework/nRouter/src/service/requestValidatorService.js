module.exports = {
    options: {
        isNew: true
    },

    validateTenantId: function(processRequest, processResponse, process) {
        console.log('   INFO: Validating tenant id : ', processRequest.originalUrl);
        if (UTILS.isBlank(processRequest.tenant)) {
            console.log('   ERROR: Invalide tenant id');
            processResponse.errors.PROC_ERR_0001 = {
                code: 'PROC_ERR_0001',
                message: 'PROC_ERR_0001',
                processName: process.getProcessName(),
                nodeName: process.getNodeName(),
                error: 'Tenant id is null or not a valid one'
            };
            process.nextFailure(processRequest, processResponse);
        } else {
            process.nextSuccess(processRequest, processResponse);
        }
    },

    validateAuthToken: function(processRequest, processResponse, process) {
        console.log('   INFO: Validating Authentication tocken : ', processRequest.originalUrl);
        if (processRequest.secured && UTILS.isBlank(processRequest.authToket)) {
            console.log('   INFO: Authentication token not fout found with request');
            processResponse.errors.PROC_ERR_0002 = {
                code: 'PROC_ERR_0002',
                message: 'PROC_ERR_0002',
                processName: process.getProcessName(),
                nodeName: process.getNodeName(),
                error: 'Resource access denined'
            };
            process.nextFailure(processRequest, processResponse);
        } else {
            process.nextSuccess(processRequest, processResponse);
        }
    },

    handleSucessEnd: function(processRequest, processResponse) {
        console.log('   1111111111111111 handleSucessEnd');
        //processRequest.res.json(processResponse.response);
    },

    handleFailureEnd: function(processRequest, processResponse) {
        console.log('   1111111111111111 handleFailureEnd');

    },

    handleError: function(processRequest, processResponse) {
        console.log('   1111111111111111 handleError ');
        //processRequest.res.jsonp(processResponse.errors);
    }
};