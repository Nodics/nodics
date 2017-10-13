module.exports = {
    flag: true,
    isValidNumber: function (){
        return this.flag;
    },

    testRout: function(req, res){
        res.send("Success Message...");
    }
}