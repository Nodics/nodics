/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
let assert = require('assert');

module.exports = class NodicsError extends Error {
    constructor(request) {
        // Validate request if it has all required values
        assert.ok(request);
        assert.ok(request.code);
        assert.ok(request.message);

        // Call super to associate message
        super(request.message);
        super.name = request.name || 'NodicsError';
        // if (request.stack) {
        //     super.stack = request.stack;
        // }
        // Assign member veriables
        this.code = request.code || 'ERR_SYS_00000';
        this.metadata = request.metadata;
    }

    toJson() {
        let errorJson = {
            code: this.code,
            name: super.name,
            message: this.message
        };
        if (this.metadata) errorJson.metadata = this.metadata;
        if (this.stack && CONFIG.get('returnErrorStack')) errorJson.stack = this.stack;
        return errorJson;
    }
};