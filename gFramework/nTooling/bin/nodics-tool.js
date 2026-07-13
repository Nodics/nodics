#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/bin/nodics-tool
 * @description CLI entrypoint that delegates non-runtime commands to the governed, project-aware tooling command service.
 * @layer tooling
 * @owner nTooling
 * @override Projects customize commands through module contributions; this stable launcher should not contain project behavior.
 */

const toolingCommandService = require('../src/service/defaultToolingCommandService');

toolingCommandService.run(process.argv.slice(2)).catch(error => {
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
});
