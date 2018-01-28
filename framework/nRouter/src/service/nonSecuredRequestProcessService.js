module.exports = {
    options: {
        isNew: true
    },

    validateEnterpriseCode: function(processRequest, processResponse, process) {
        console.log('   INFO: Validating Enterprise code : ', processRequest.enterpriseCode);
        if (UTILS.isBlank(processRequest.enterpriseCode)) {
            console.log('   ERROR: Enterprise code can not be null');
            process.error(processRequest, processResponse, 'Enterprise code can not be null');
        } else {
            process.nextSuccess(processRequest, processResponse);
        }
    },

    loadEnterpriseCode: function(processRequest, processResponse, process) {
        console.log('   INFO: Loading Enterprise code : ', processRequest.enterpriseCode);
        try {
            SERVICE.EnterpriseProviderService.loadEnterprise(processRequest, (error, response) => {
                if (error) {
                    console.log('   ERROR: Enterprise code is not valid');
                    process.error(processRequest, processResponse, error || 'Enterprise code is not valid');
                } else {
                    processRequest.enterprise = response;
                    processRequest.tenant = response.tenant;
                    process.nextSuccess(processRequest, processResponse);
                }
            });
        } catch (err) {
            console.log('   ERROR: Enterprise code is not valid');
            process.error(processRequest, processResponse, error || 'Enterprise code is not valid');
        }
    },

    validateTenantId: function(processRequest, processResponse, process) {
        console.log('   INFO: Validating Tenant Id : ', processRequest.tenant);
        try {
            if (UTILS.isBlank(processRequest.tenant)) {
                console.log('   ERROR: Tenant is null or invalid');
                process.error(processRequest, processResponse, 'Tenant is null or invalid');
            } else {
                process.nextSuccess(processRequest, processResponse);
            }
        } catch (err) {
            process.error(processRequest, processResponse, 'Tenant is null or invalid');
        }
    }
};