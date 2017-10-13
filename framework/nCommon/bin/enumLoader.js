const _ = require('lodash');
const Enum = require('./enum');

module.exports = {
    loadEnums: function() {
        let _self = this;
        let enums = global.ENUMS = {};
        let enumScript = {};
        console.log('##  Staring Utils loader process');
        SYSTEM.loadFiles(CONFIG, '/src/utils/enums.js', enumScript);

        _.each(enumScript, function(value, key) {
            let _option = _self.createEnumOptions(key, value);
            if (_option) {
                enums[key] = new Enum(value.definition, _option);
            } else {
                enums[key] = new Enum(value.definition);
            }
        });
    },

    createEnumOptions: function(key, enumValue) {
        if (enumValue._options) {
            let _option = {
                name: enumValue._options.name || key,
                separator: enumValue._options.separator || '|',
                ignoreCase: enumValue._options.ignoreCase || false,
                freez: enumValue._options.freez || false
            };
            if (enumValue._options.endianness) {
                _option.endianness = enumValue._options.endianness;
            }

            return _option;
        }
    }
}