module.exports = {
    options: {
        isNew: false
    }, 

    getFullName: function (inputParam) {
        return SERVICE.UserService.getFullName(inputParam);
    }
}