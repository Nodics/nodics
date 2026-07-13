/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module nTooling/quality/checkCopyrightHeaders
 * @description Validates and normalizes the standard Nodics copyright header for JavaScript source and generated artifacts.
 * @layer tooling
 * @owner nTooling
 * @override Projects may replace this command only when their legal header contract is explicitly different.
 */

const requiredHeader = '/*\n' +
    '    Nodics - Enterprice Micro-Services Management Framework\n' +
    '\n' +
    '    Copyright (c) 2017 Nodics All rights reserved.\n' +
    '\n' +
    '    This software is the confidential and proprietary information of Nodics ("Confidential Information").\n' +
    '    You shall not disclose such Confidential Information and shall use it only in accordance with the\n' +
    '    terms of the license agreement you entered into with Nodics.\n' +
    '\n' +
    ' */\n';

const excludedDirectories = new Set([
    '.git',
    '.idea',
    '.vscode',
    'node_modules',
    'logs',
    'temp',
    'tmp',
    'dist',
    'docs'
]);

const excludedFiles = new Map([
    ['gFramework/nConfig/bin/enum.js', 'Bundled third-party enum compatibility implementation.']
]);

function readOption(args, name, defaultValue) {
    const prefix = name + '=';
    const match = (args || []).find(arg => arg.indexOf(prefix) === 0);
    return match ? match.slice(prefix.length) : defaultValue;
}

function relative(filePath, rootDir) {
    return path.relative(rootDir, filePath).split(path.sep).join('/');
}

function isExcludedFile(filePath, rootDir) {
    return excludedFiles.has(relative(filePath, rootDir));
}

function walk(dir, files, rootDir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        if (entry.name.startsWith('.')) {
            return;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (excludedDirectories.has(entry.name)) {
                return;
            }
            walk(fullPath, files, rootDir);
            return;
        }
        if (entry.isFile() && entry.name.endsWith('.js') && !isExcludedFile(fullPath, rootDir)) {
            files.push(fullPath);
        }
    });
}

function splitShebang(content) {
    if (!content.startsWith('#!')) {
        return {
            shebang: '',
            body: content
        };
    }
    const newlineIndex = content.indexOf('\n');
    if (newlineIndex < 0) {
        return {
            shebang: content + '\n',
            body: ''
        };
    }
    return {
        shebang: content.slice(0, newlineIndex + 1),
        body: content.slice(newlineIndex + 1)
    };
}

function stripExistingNodicsHeader(body) {
    const trimmedStart = body.replace(/^\uFEFF/, '');
    const leadingWhitespaceLength = trimmedStart.length - trimmedStart.replace(/^\s*/, '').length;
    const leadingWhitespace = trimmedStart.slice(0, leadingWhitespaceLength);
    const content = trimmedStart.slice(leadingWhitespaceLength);
    if (!content.startsWith('/*')) {
        return body;
    }
    const endIndex = content.indexOf('*/');
    if (endIndex < 0) {
        return body;
    }
    const candidate = content.slice(0, endIndex + 2);
    if (!candidate.includes('Nodics - Enterprice Micro-Services Management Framework') ||
        !candidate.includes('Copyright (c) 2017 Nodics All rights reserved.')) {
        return body;
    }
    return leadingWhitespace + content.slice(endIndex + 2).replace(/^\s*\n?/, '');
}

function normalizeContent(content) {
    const shebangParts = splitShebang(content);
    const body = stripExistingNodicsHeader(shebangParts.body);
    return shebangParts.shebang + requiredHeader + '\n' + body.replace(/^\s+/, '');
}

function hasRequiredHeader(content) {
    const shebangParts = splitShebang(content);
    return shebangParts.body.startsWith(requiredHeader);
}

function collect(rootDir) {
    const files = [];
    walk(rootDir, files, rootDir);
    return files.sort();
}

function inspectFiles(options) {
    const files = collect(options.rootDir);
    const missing = [];
    const fixed = [];
    files.forEach(filePath => {
        const content = fs.readFileSync(filePath, 'utf8');
        if (hasRequiredHeader(content)) {
            return;
        }
        const normalized = normalizeContent(content);
        if (options.fix && normalized !== content) {
            fs.writeFileSync(filePath, normalized, 'utf8');
            fixed.push(relative(filePath, options.rootDir));
            return;
        }
        missing.push(relative(filePath, options.rootDir));
    });
    return {
        filesChecked: files.length,
        filesMissingHeader: missing,
        filesFixed: fixed,
        excludedFiles: Array.from(excludedFiles.keys())
    };
}

function createOptions(args) {
    args = args || [];
    const configuredHome = readOption(args, '--home', process.env.NODICS_HOME || '');
    return {
        rootDir: configuredHome ? path.resolve(configuredHome) : process.cwd(),
        fix: args.includes('--fix'),
        failOnMissing: args.includes('--fail') || !args.includes('--fix'),
        reportLimit: Number(readOption(args, '--limit', '80'))
    };
}

function printReport(report, limit) {
    console.log('Nodics copyright header governance');
    console.log('Files checked              : ' + report.filesChecked);
    console.log('Files fixed                : ' + report.filesFixed.length);
    console.log('Files missing header       : ' + report.filesMissingHeader.length);
    console.log('Excluded files             : ' + report.excludedFiles.length);
    if (report.filesMissingHeader.length > 0) {
        console.log('\nFiles missing copyright header:');
        report.filesMissingHeader.slice(0, limit).forEach(file => console.log('  - ' + file));
        if (report.filesMissingHeader.length > limit) {
            console.log('  ... ' + (report.filesMissingHeader.length - limit) + ' more');
        }
    }
    if (report.filesFixed.length > 0) {
        console.log('\nFiles normalized:');
        report.filesFixed.slice(0, limit).forEach(file => console.log('  - ' + file));
        if (report.filesFixed.length > limit) {
            console.log('  ... ' + (report.filesFixed.length - limit) + ' more');
        }
    }
}

function runCli(args) {
    const options = createOptions(args);
    const report = inspectFiles(options);
    printReport(report, options.reportLimit);
    if (options.failOnMissing && report.filesMissingHeader.length > 0) {
        process.exitCode = 1;
    }
}

if (require.main === module) {
    runCli(process.argv.slice(2));
}

module.exports = {
    collect,
    createOptions,
    inspectFiles,
    normalizeContent,
    requiredHeader,
    runCli
};
