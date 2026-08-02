/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nConfig/src/service/defaultSampleService
 * @description Implements config default sample service business behavior and extension logic.
 * @layer service
 * @owner config
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading.
     * defined it that with Promise way
     * @param {*} options
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading.
     * defined it that with Promise way
     * @param {*} options
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
};
