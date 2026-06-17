const assert = require('assert');
const fs = require('fs');
const path = require('path');

const {
    scanModules
} = require('../module-llm-context-utils');

const modules = scanModules();

assert(modules.length > 0, 'No Nodics modules were discovered');

modules.forEach(module => {
    let llmDirectory = path.join(module.path, 'llm');
    let generatedDirectory = path.join(llmDirectory, 'generated');
    assert(fs.existsSync(llmDirectory), 'Missing llm folder for module: ' + module.relativePath);
    assert(fs.existsSync(path.join(llmDirectory, 'README.md')), 'Missing llm README for module: ' + module.relativePath);
    if (module.relativePath === 'gSetup') {
        return;
    }
    assert(fs.existsSync(generatedDirectory), 'Missing generated llm folder for module: ' + module.relativePath);
    ['module-context.md', 'schemas.md', 'tests.md', 'manifest.json'].forEach(fileName => {
        assert(fs.existsSync(path.join(generatedDirectory, fileName)), 'Missing generated LLM file ' + fileName + ' for module: ' + module.relativePath);
    });
});

console.log('Module LLM context validated: ' + modules.length + ' modules');
