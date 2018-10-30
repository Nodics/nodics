module.exports = {

    handleTestEvent: function (event, callback) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('#Event has been Handled ');
            resolve('success');
        });
    }
};