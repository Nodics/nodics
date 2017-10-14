module.exports = {
    options: {
        isNew: false
    }, 

    getFullName: function (req, res) {
       let inputParam = {
            req: req,
            res: res
        }
        FACADE.UserFacade.getFullName(inputParam);
    }
}