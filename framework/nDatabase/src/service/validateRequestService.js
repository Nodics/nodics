module.exports = {

    validateInputFilter: function(requestBody) {
        return new Promise((resolve, reject) => {
            if (requestBody && requestBody.select) {
                if (!UTILS.isObject(requestBody.select)) {
                    reject('Invalid select value');
                }
            }
            if (requestBody && requestBody.sort) {
                if (!UTILS.isObject(requestBody.sort)) {
                    reject('Invalid sort value');
                }
            }
            resolve(true);
        });
    }
};