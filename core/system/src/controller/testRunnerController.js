module.exports = {

    runUTest: function(requestContext, callback) {
        let input = {
            tenant: requestContext.tenant,
            enterpriseCode: requestContext.enterpriseCode
        };
        FACADE.TestRunnerFacade.runUTest(input, callback);
    },

    runNTest: function(requestContext, callback) {
        let input = {
            tenant: requestContext.tenant,
            enterpriseCode: requestContext.enterpriseCode
        };
        FACADE.TestRunnerFacade.runNTest(input, callback);
    }
};