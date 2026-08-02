/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * Generates initial immutable release manifests for module-owned init, core,
 * and sample data. Existing manifests are validated and are never silently
 * rewritten because changing checksums requires an intentional version bump.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../..');
const dataTypes = new Set(['init', 'core', 'sample']);
const releaseIndex = process.argv.indexOf('--release');
const requestedRelease = releaseIndex >= 0 ? String(process.argv[releaseIndex + 1] || '') : '';
const requestedParts = requestedRelease.split('=');
const requestedKey = requestedParts[0];
const requestedVersion = requestedParts[1];
if (requestedRelease && (!/^[A-Za-z][A-Za-z0-9_-]{0,127}:(init|core|sample)$/.test(requestedKey) ||
    !/^\d+\.\d+\.\d+$/.test(requestedVersion || ''))) {
    throw new Error('Use --release <module>:<init|core|sample>=<major.minor.patch>');
}

function hash(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function filesBelow(folder, prefix = '') {
    if (!fs.existsSync(folder)) return [];
    return fs.readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
        let relative = prefix ? prefix + '/' + entry.name : entry.name;
        let absolute = path.join(folder, entry.name);
        return entry.isDirectory() ? filesBelow(absolute, relative) : [relative];
    });
}

function visit(folder) {
    if (['.git', 'node_modules', 'docs'].includes(path.basename(folder))) return [];
    let packagePath = path.join(folder, 'package.json');
    let generated = [];
    if (fs.existsSync(packagePath)) {
        let packageMetadata = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (packageMetadata.nodics && packageMetadata.name) {
            let dataRoot = path.join(folder, 'data');
            for (let dataType of dataTypes) {
                let releaseRoot = path.join(dataRoot, dataType);
                if (!fs.existsSync(releaseRoot)) continue;
                let releaseFiles = filesBelow(releaseRoot).filter(file => file !== 'manifest.json');
                if (releaseFiles.length === 0) continue;
                let manifestPath = path.join(releaseRoot, 'manifest.json');
                let files = Object.fromEntries(releaseFiles.map(file => [file, hash(path.join(releaseRoot, file))]));
                let manifest = {
                    contractVersion: 1,
                    module: packageMetadata.name,
                    dataType: dataType,
                    version: '1.0.0',
                    description: (packageMetadata.nodics.displayName || packageMetadata.name) + ' ' + dataType + ' data',
                    files: files
                };
                if (fs.existsSync(manifestPath)) {
                    let existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    if (JSON.stringify(existing.files || {}) !== JSON.stringify(files)) {
                        if (requestedKey === packageMetadata.name + ':' + dataType &&
                            requestedVersion !== existing.version) {
                            manifest.version = requestedVersion;
                            fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4) + '\n');
                            generated.push(path.relative(root, manifestPath));
                            continue;
                        }
                        throw new Error('Data release changed without an intentional manifest version update: ' + manifestPath);
                    }
                    continue;
                }
                fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 4) + '\n');
                generated.push(path.relative(root, manifestPath));
            }
        }
    }
    for (let entry of fs.readdirSync(folder, { withFileTypes: true })) {
        if (entry.isDirectory()) generated.push(...visit(path.join(folder, entry.name)));
    }
    return generated;
}

let generated = visit(root);
console.log('Generated data release manifests: ' + generated.length);
