/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/test/extensibilityConfigurationBoundary
 * @description Prevents known hardcoded policy and duplicate-default patterns from returning to loader-managed runtime implementations.
 * @layer test
 * @owner nTooling
 * @override Extend rules only for stable architecture boundaries; this is not a general literal-value style check.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../..');
const implementationFolders = new Set(['service', 'controller', 'facade']);
const violations = [];
const rules = [
    {
        code: 'IDENTITY_POLICY_LITERAL',
        expression: /['"](?:adminGroup|customerUserGroup|employeeUserGroup|serviceAccountUserGroup|runtimeConfig[A-Za-z]+UserGroup)['"]/,
        message: 'Identity group codes must resolve from layered policy instead of implementation literals.'
    },
    {
        code: 'PROVIDER_ENDPOINT_LITERAL',
        expression: /https:\/\/(?:api\.openai\.com|api\.anthropic\.com|generativelanguage\.googleapis\.com|aiplatform\.googleapis\.com)/,
        message: 'Provider endpoints belong to provider properties.js contributions.'
    },
    {
        code: 'SERVICE_COMMUNICATION_DEFAULT_COPY',
        expression: /retry:\s*\{\s*maxAttempts:\s*2,\s*baseDelayMs:\s*50/,
        message: 'Module HTTP defaults belong only to nService layered configuration.'
    },
    {
        code: 'AUTH_SECURITY_DEFAULT_COPY',
        expression: /minimumSecretLength:\s*32.*accessTokenExpiresIn:\s*['"]3h['"]/s,
        message: 'Authentication defaults belong only to nAuth layered configuration.'
    },
    {
        code: 'CMS_DELIVERY_DEFAULT_COPY',
        expression: /defaultLocale:\s*['"]default['"].*defaultChannel:\s*['"]web['"].*maxDepth:\s*12/s,
        message: 'CMS delivery defaults belong only to CMS layered configuration.'
    },
    {
        code: 'BACKOFFICE_REGISTRATION_DEFAULT_COPY',
        expression: /config\.(?:heartbeatIntervalMs\s*\|\|\s*10000|retryIntervalMs\s*\|\|\s*5000|maxModulesPerRegistration\s*\|\|\s*512|moduleName\s*\|\|\s*['"]backoffice['"])/,
        message: 'BackOffice registration defaults belong only to nService layered configuration.'
    },
    {
        code: 'REFERENCE_INTEGRITY_DEFAULT_COPY',
        expression: /config\.(?:maximumRelationships|maximumTargetRecords)\s*\|\|/,
        message: 'Reference-integrity bounds belong only to nDatabase layered configuration.'
    },
    {
        code: 'HAZELCAST_CONNECTION_DEFAULT_COPY',
        expression: /options\.(?:clusterName\s*\|\|\s*['"]dev['"]|clusterMembers\s*\|\|\s*\[|connectionTimeoutMs\s*\|\|\s*5000)/,
        message: 'Hazelcast connection defaults belong only to nCache layered configuration.'
    }
];

function walk(directory) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach(entry => {
        if (['node_modules', '.git', 'gen', 'generated', 'test'].includes(entry.name)) return;
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) return walk(target);
        if (!entry.isFile() || path.extname(entry.name) !== '.js') return;
        const segments = target.split(path.sep);
        if (!segments.some(segment => implementationFolders.has(segment))) return;
        const source = fs.readFileSync(target, 'utf8');
        rules.forEach(rule => {
            if (rule.expression.test(source)) {
                violations.push(path.relative(repositoryRoot, target) + ' [' + rule.code + '] ' + rule.message);
            }
        });
    });
}

walk(repositoryRoot);
assert.deepStrictEqual(violations, [], 'Extensibility configuration boundary violations:\n' + violations.join('\n'));
console.log('Extensibility configuration boundary validated');
