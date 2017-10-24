const definitionBuilder = require('./bin/processDefinitionBuilder');

module.exports.init = function() {
    console.log('=> Starting Process Defintion builder process');
    definitionBuilder.init();
};