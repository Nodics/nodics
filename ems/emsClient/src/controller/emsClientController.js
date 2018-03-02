module.exports = {
    publish: function(requestContext, callback) {
        if (!UTILS.isBlank(requestContext.httpRequest.body)) {
            let request = requestContext.httpRequest.body;
            request.tenant = requestContext.tenant;
            request.enterpriseCode = requestContext.enterpriseCode;
            request.authToken = requestContext.authToken;

            return FACADE.EmsClientFacade.publish(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one. Request should contain body: {queue:queueName, message:message}');
        }
    }
};