module.exports = {
    cronjob: {
        testListener: {
            event: 'testMe',
            listner: 'SERVICE.EventTestService.handleTestEvent'
        }
    }
};