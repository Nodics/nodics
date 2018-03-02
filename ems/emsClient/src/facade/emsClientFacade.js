module.exports = {

    publish: function(input, callback) {
        return SERVICE.EmsClientService.publish(input, callback);
    }
};