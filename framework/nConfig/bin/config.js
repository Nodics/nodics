/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = function() {
    let _tntProperties = {};

    this.setProperties = function(properties, tenant) {
        if (tenant) {
            _tntProperties[tenant] = properties;
        } else {
            _tntProperties['default'] = properties;
        }
    };
    this.getProperties = function(tenant) {
        if (tenant) {
            return _tntProperties[tenant];
        } else {
            return _tntProperties['default'];
        }
    };

    this.get = function(key, tenant) {
        let tntProperties = this.getProperties(tenant);
        if (!tntProperties) {
            SYSTEM.LOG.error("   ERROR: System could't find any properties for current Tanent : ", tenant ? tenant : NODICS.getActiveTanent());
            return null;
        }
        return tntProperties[key];
    };
};