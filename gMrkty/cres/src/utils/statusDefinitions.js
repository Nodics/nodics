/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gMrkty/cres/src/utils/statusDefinitions.js
 * @description Provides shared cres status and error definition exports.
 * @layer utils
 * @owner cres
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  ERR_CRES_00001: {
    code: "500",
    message: "CRES governance policy is incomplete",
  },
  ERR_CRES_00002: { code: "400", message: "Customer review is invalid" },
  ERR_CRES_00003: {
    code: "400",
    message: "Customer review moderation event is invalid",
  },
  ERR_CRES_00004: {
    code: "400",
    message: "Customer review abuse report is invalid",
  },
};
