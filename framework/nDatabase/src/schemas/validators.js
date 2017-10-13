/*
 * All methods defined in this file, will be directly accessible from DB.validator
 */
module.exports = {
    checkIfCreatedDateIsNull: function(value) {
        if (value) {
            return true;
        }
        return false;
    }
};