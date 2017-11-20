module.exports = {
    options: {
        isNew: true
    },

    validateTenantId: function(processRequest, processResponse, process) {
        console.log('   ----======= Handling validateTenantId : ', SYSTEM.isBlank(processRequest.tenant));
        if (SYSTEM.isBlank(processRequest.tenant)) {
            console.log('   11111');
            processResponse.errors.PROC_ERR_0001 = {
                code: 'PROC_ERR_0001',
                message: 'PROC_ERR_0001',
                processName: process.getProcessName(),
                nodeName: process.getNodeName(),
                error: 'Tenant id is null or not a valid one'
            };
            process.nextFailure(processRequest, processResponse);
        } else {
            console.log('   22222');
            process.nextSuccess(processRequest, processResponse);
        }
    },

    validateAuthTocken: function(processRequest, processResponse, process) {
        console.log('   ======= Handling validateAuthTocken');
        if (processRequest.secured && SYSTEM.isBlank(processRequest.authTocket)) {
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