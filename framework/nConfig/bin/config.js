module.exports = function() {
    let _tntProperties = {};

    this.setProperties = function(properties, tanent) {
        if (tanent) {
            _tntProperties[tanent] = properties;
        } else {
            _tntProperties['default'] = properties;
        }
    };
    this.getProperties = function(tanent) {
        if (tanent) {
            return _tntProperties[tanent];
        } else {
            return _tntProperties[SYSTEM.currentTanent || 'default'];
        }
    };

    this.get = function(key, tanent) {
        let tntProperties = this.getProperties(tanent);
        if (!tntProperties) {
            console.log("   ERROR: System could't find any properties for current Tanent : ", tanent ? tanent : SYSTEM.currentTanent);
            return null;
        }
        return tntProperties[key];
    };
};