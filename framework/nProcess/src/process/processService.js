module.exports = {
    startProcess: function(processName, processRequest, processResponse) {
        let success = false;
        let request = processRequest || {};
        let response = processResponse || {};
        if (PROCESS[processName]) {
            response.errors = {};
            try {
                PROCESS[processName].start(request, response);
                success = true;
            } catch (err) {
                response.errors.PROC_ERR_0000 = {
                    code: 'PROC_ERR_0000',
                    message: 'PROC_ERR_0000',
                    error: err
                };
            }
        }
        if (!response.success) {
            response.success = success;
        }
        return response;
    }
};