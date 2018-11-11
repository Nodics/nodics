module.exports = {

    validateEnterpriseCode: function (request, response, process) {
        this.LOG.debug('Validating Enterprise code : ', request.enterpriseCode);
        if (UTILS.isBlank(request.enterpriseCode)) {
            this.LOG.error('Enterprise code can not be null');
            process.error(request, response, 'Enterprise code can not be null');
        } else {
            process.nextSuccess(request, response);
        }
    },

    loadEnterpriseCode: function (request, response, process) {
        this.LOG.debug('Loading Enterprise code : ', request.enterpriseCode);
        try {
            request.tenant = 'default';
            SERVICE.DefaultEnterpriseProviderService.loadEnterprise(request).then(response => {
                request.enterprise = response;
                request.tenant = response.tenant.code;
                process.nextSuccess(request, response);
            }).catch(error => {
                this.LOG.error('Enterprise code is not valid');
                process.error(request, response, error || 'Enterprise code is not valid');
            });
        } catch (error) {
            this.LOG.error('Enterprise code is not valid: ', error);
            process.error(request, response, error || 'Enterprise code is not valid');
        }
    },

    validateTenantId: function (request, response, process) {
        this.LOG.debug('Validating Tenant Id : ', request.tenant);
        try {
            if (UTILS.isBlank(request.tenant)) {
                this.LOG.error('Tenant is null or invalid');
                process.error(request, response, 'Tenant is null or invalid');
            } else {
                process.nextSuccess(request, response);
            }
        } catch (err) {
            process.error(request, response, 'Tenant is null or invalid');
        }
    }
};