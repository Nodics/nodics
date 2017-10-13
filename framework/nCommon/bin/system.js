const fs = require('fs');
const path = require("path");

module.exports = {
    getFileNameWithoutExtension: function(filePath) {
        let fileName = filePath.substring(filePath.lastIndexOf("/") + 1, filePath.indexOf("."));
        fileName = fileName.toUpperCaseFirstChar();

        return fileName;
    },

    processFiles: function(filePath, filePostFix, calback, exclude) {
        if (fs.existsSync(filePath)) {
            let files = fs.readdirSync(filePath);
            if (files) {
                files.map(function(file) {
                    return path.join(filePath, file);
                }).filter(function(file) {
                    return fs.statSync(file).isFile();
                }).filter(function(file) {
                    if (!filePostFix || filePostFix === '*') {
                        return true;
                    } else {
                        return file.endsWith(filePostFix);
                    }
                }).forEach(function(file) {
                    calback(file);
                });
            }
        }
    }
}