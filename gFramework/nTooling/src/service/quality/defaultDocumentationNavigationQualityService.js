/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module nTooling/service/quality/defaultDocumentationNavigationQualityService
 * @description Validates public documentation links, path case, entry-point reachability, page continuation, and exhaustive module README navigation.
 * @layer tooling
 * @owner nTooling
 * @override Projects may change navigation roots and required entry points through `tooling.documentationGovernance.navigation`.
 */

const ignoredDirectories = new Set(['.git', 'node_modules', 'docs', 'gen', 'generated']);

function toPosix(filePath) {
    return filePath.split(path.sep).join('/');
}

function walkFiles(rootDir, currentDir, predicate, files) {
    files = files || [];
    fs.readdirSync(currentDir, { withFileTypes: true }).forEach(entry => {
        if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
            return;
        }
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
            walkFiles(rootDir, fullPath, predicate, files);
        } else if (predicate(fullPath)) {
            files.push(toPosix(path.relative(rootDir, fullPath)));
        }
    });
    return files;
}

function extractLocalMarkdownLinks(content) {
    const links = [];
    const pattern = /(?<!!)\[[^\]]*\]\(([^)]+)\)/g;
    let match;
    while ((match = pattern.exec(content)) !== null) {
        const target = match[1].trim().replace(/^<|>$/g, '').split('#')[0];
        if (target && !/^[a-z]+:/i.test(target)) {
            links.push(decodeURIComponent(target));
        }
    }
    return links;
}

function hasExactPathCase(rootDir, relativePath) {
    const parts = toPosix(relativePath).split('/').filter(Boolean);
    let current = rootDir;
    for (const part of parts) {
        if (!fs.existsSync(current) || !fs.statSync(current).isDirectory()) {
            return false;
        }
        if (!fs.readdirSync(current).includes(part)) {
            return false;
        }
        current = path.join(current, part);
    }
    return true;
}

function resolveTarget(source, link) {
    return toPosix(path.normalize(path.join(path.dirname(source), link)));
}

function collectPackageReadmes(rootDir) {
    return walkFiles(rootDir, rootDir, filePath => path.basename(filePath) === 'package.json')
        .filter(packagePath => packagePath !== 'package.json')
        .map(packagePath => toPosix(path.join(path.dirname(packagePath), 'README.md')))
        .filter(readmePath => fs.existsSync(path.join(rootDir, readmePath)))
        .sort();
}

function collectNavigationReport(rootDir, policy) {
    const entryPoint = policy.entryPoint || 'README.md';
    const publicRoot = policy.publicRoot || 'gDocs';
    const publicIndex = policy.publicIndex || 'gDocs/README.md';
    const moduleCatalog = policy.moduleCatalog || 'gDocs/reference/module-catalog.md';
    const excluded = new Set(policy.excludedPublicPages || []);
    const markdownFiles = [entryPoint].concat(walkFiles(
        rootDir,
        path.join(rootDir, publicRoot),
        filePath => filePath.endsWith('.md')
    ));
    const graph = new Map();
    const brokenLinks = [];
    const caseMismatches = [];

    markdownFiles.forEach(source => {
        const content = fs.readFileSync(path.join(rootDir, source), 'utf8');
        const targets = extractLocalMarkdownLinks(content).map(link => ({
            link,
            target: resolveTarget(source, link)
        }));
        graph.set(source, targets.map(item => item.target));
        targets.forEach(item => {
            const fullTarget = path.join(rootDir, item.target);
            if (!fs.existsSync(fullTarget)) {
                brokenLinks.push({ source, target: item.link });
            } else if (!hasExactPathCase(rootDir, item.target)) {
                caseMismatches.push({ source, target: item.link });
            }
        });
    });

    const reachable = new Set([entryPoint]);
    const queue = [entryPoint];
    while (queue.length > 0) {
        const source = queue.shift();
        (graph.get(source) || []).forEach(target => {
            if (graph.has(target) && !reachable.has(target)) {
                reachable.add(target);
                queue.push(target);
            }
        });
    }

    const publicPages = markdownFiles.filter(filePath => filePath.startsWith(publicRoot + '/') && !excluded.has(filePath));
    const unreachablePages = publicPages.filter(filePath => !reachable.has(filePath));
    const deadEndPages = publicPages.filter(filePath => filePath !== publicIndex &&
        !fs.readFileSync(path.join(rootDir, filePath), 'utf8').includes('\n## Continue\n'));
    const missingRequiredEntryPoints = (policy.requiredEntryPoints || []).filter(filePath =>
        !fs.existsSync(path.join(rootDir, filePath)) || !reachable.has(filePath));

    const catalogContent = fs.existsSync(path.join(rootDir, moduleCatalog)) ?
        fs.readFileSync(path.join(rootDir, moduleCatalog), 'utf8') : '';
    const catalogTargets = new Set(extractLocalMarkdownLinks(catalogContent).map(link => resolveTarget(moduleCatalog, link)));
    const missingModuleReadmes = collectPackageReadmes(rootDir).filter(readmePath => !catalogTargets.has(readmePath));

    return {
        markdownFiles: markdownFiles.length,
        publicPages: publicPages.length,
        packageReadmes: collectPackageReadmes(rootDir).length,
        brokenLinks,
        caseMismatches,
        unreachablePages,
        deadEndPages,
        missingRequiredEntryPoints,
        missingModuleReadmes
    };
}

function hasFailures(report) {
    return ['brokenLinks', 'caseMismatches', 'unreachablePages', 'deadEndPages',
        'missingRequiredEntryPoints', 'missingModuleReadmes'].some(key => report[key].length > 0);
}

function printItems(label, items) {
    if (items.length === 0) {
        return;
    }
    console.error(label + ':');
    items.forEach(item => console.error('  - ' + (typeof item === 'string' ? item : item.source + ' -> ' + item.target)));
}

function printReport(report) {
    console.log('\nENFORCED: public documentation navigation');
    console.log('Markdown entry/public files : ' + report.markdownFiles);
    console.log('Governed public pages       : ' + report.publicPages);
    console.log('Cataloged module READMEs    : ' + (report.packageReadmes - report.missingModuleReadmes.length) + '/' + report.packageReadmes);
    printItems('Broken local links', report.brokenLinks);
    printItems('Path-case mismatches', report.caseMismatches);
    printItems('Unreachable public pages', report.unreachablePages);
    printItems('Pages without Continue navigation', report.deadEndPages);
    printItems('Missing required entry points', report.missingRequiredEntryPoints);
    printItems('Module READMEs missing from catalog', report.missingModuleReadmes);
}

module.exports = {
    collectNavigationReport,
    extractLocalMarkdownLinks,
    hasExactPathCase,
    hasFailures,
    printReport
};
