#!/usr/bin/env node
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
