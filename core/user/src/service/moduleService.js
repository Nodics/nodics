var requestPromise = require('request-promise');

module.exports = {
    options: {
        isNew: true
    },
    buildRequest: function(moduleName, methodName, apiName, requestBody, contentType, isJsonResponse) {
        return {
            method: methodName || 'GET',
            uri: SYSTEM.prepareConnectionUrl(moduleName) + '/' + apiName,
            headers: {
                'content-type': contentType || CONFIG.defaultContentType
            },
            body: requestBody,
            json: isJsonResponse || true
        };
    },

    fetch: function(options, callback) {
        console.log('Calling ', options);
        if (callback) {
            requestPromise(options)
                .then(function(response) {
                    callback(null, response, options);
                })
                .catch(function(error) {
                    callback(error, null, options);
                });
        } else {
            return requestPromise(options);
        }
    }
};