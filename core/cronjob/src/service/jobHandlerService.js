module.exports = {
    options: {
        isNew: true
    },

    handleCronJobStart: function(definition, cronJob) {
        console.log('Job Started........');
    },

    handleCronJobEnd: function(definition, cronJob) {
        console.log('Job End........');
    },

    handleCronJobPaused: function(definition, cronJob) {
        console.log('Job End........');
    },

    handleCronJobResumed: function(definition, cronJob) {
        console.log('Job End........');
    },

    handleJobTriggered: function(definition, cronJob) {
        console.log('Job Triggered........');
    },

    handleJobCompleted: function(definition, cronJob) {
        console.log('Job Completed........');
    },

    handleSuccess: function(definition, job) {
        console.log('=============== handleSuccess');
        //throw new Error("Cron Job Error");
    },

    handleError: function(definition, job, error) {
        console.log('=============== handleError : ', error);
    }
};