module.exports = {
    startJobsOnStartup: false,
    cronJobStartWaitInterval: 1000,
    server: {
        cronjob: {
            httpServer: 'localhost',
            httpPort: 3002,

            httpsServer: 'localhost',
            httpsPort: 3003,
        }
    }
};