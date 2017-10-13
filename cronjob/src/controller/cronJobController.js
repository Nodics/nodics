module.exports = {
    options: {
        isNew: false
    },

    create: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        };
        FACADE.CronJobFacade.create(inputParam);
    },

    update: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        };
        FACADE.CronJobFacade.update(inputParam);
    },

    run: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        };
        FACADE.CronJobFacade.run(inputParam);
    },

    start: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        };
        if (req.body) {
            inputParam.jobName = req.body;
        } else {
            inputParam.jobName = req.params.jobName;
        }
        FACADE.CronJobFacade.start(inputParam);
    },
    stop: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        };
        if (req.body) {
            inputParam.jobName = req.body;
        } else {
            inputParam.jobName = req.params.jobName;
        }
        FACADE.CronJobFacade.stop(inputParam);
    },
    remove: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        };
        if (req.body) {
            inputParam.jobName = req.body;
        } else {
            inputParam.jobName = req.params.jobName;
        }
        FACADE.CronJobFacade.remove(inputParam);
    },
    pause: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        };
        if (req.body) {
            inputParam.jobName = req.body;
        } else {
            inputParam.jobName = req.params.jobName;
        }
        FACADE.CronJobFacade.pause(inputParam);
    },
    resume: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        };
        if (req.body) {
            inputParam.jobName = req.body;
        } else {
            inputParam.jobName = req.params.jobName;
        }
        FACADE.CronJobFacade.resume(inputParam);
    }
};