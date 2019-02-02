module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    validateEnterpriseCode: function (request, response, process) {
        this.LOG.debug('Validating Enterprise code : ', request.enterpriseCode);
        if (UTILS.isBlank(request.enterpriseCode)) {
            this.LOG.error('Enterprise code can not be null');
            process.error(request, response, {
                success: false,
                code: 'ERR_ENT_00000'
            });
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
                process.error(request, response, error || {
                    success: false,
                    code: 'ERR_ENT_00000'
                });
            });
        } catch (error) {
            this.LOG.error('Enterprise code is not valid: ', error);
            process.error(request, response, error || {
                success: false,
                code: 'ERR_ENT_00000'
            });
        }
    },

    validateTenantId: function (request, response, process) {
        this.LOG.debug('Validating Tenant Id : ', request.tenant);
        try {
            if (UTILS.isBlank(request.tenant)) {
                this.LOG.error('Tenant is null or invalid');
                process.error(request, response, {
                    success: false,
                    code: 'RR_TNT_00000'
                });
            } else {
                process.nextSuccess(request, response);
            }
        } catch (err) {
            process.error(request, response, {
                success: false,
                code: 'RR_TNT_00000',
                msg: 'Tenant is null or invalid'
            });
        }
    }
};