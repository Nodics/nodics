/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module tax/src/facade/defaultTaxBackofficeFacade
 * @description Placeholder for future Tax API facade contracts. Tax calculation remains service-owned until an explicit API facade is introduced.
 * @layer facade
 * @owner tax
 * @override Project modules may add Tax facades through later layers without changing this OOTB boundary.
 */
module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
};
