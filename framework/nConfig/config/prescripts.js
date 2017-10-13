module.exports = {
    addStringCamelCaseFunction: function() {
        String.prototype.toUpperCaseFirstChar = function() {
            return this.substr(0, 1).toUpperCase() + this.substr(1);
        };

        String.prototype.toLowerCaseFirstChar = function() {
            return this.substr(0, 1).toLowerCase() + this.substr(1);
        };

        String.prototype.toUpperCaseEachWord = function(delim) {
            delim = delim ? delim : ' ';
            return this.split(delim).map(function(v) {
                return v.toUpperCaseFirstChar();
            }).join(delim);
        };

        String.prototype.toLowerCaseEachWord = function(delim) {
            delim = delim ? delim : ' ';
            return this.split(delim).map(function(v) {
                return v.toLowerCaseFirstChar();
            }).join(delim);
        };

        String.prototype.replaceAll = function(match, replace) {
            return this.replace(new RegExp(match, 'g'), replace);
        };
    }
};