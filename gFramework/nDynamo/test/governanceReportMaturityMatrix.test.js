/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nDynamo/test/GovernanceReportMaturityMatrix
 * @description Validates source-derived provider and capability maturity
 * evidence emitted by the governance report generator.
 * @layer test
 * @owner nDynamo
 * @override Projects may extend governance report fields, but provider and
 * capability maturity must remain generated from repository evidence.
 */

const assert = require('assert');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '../../..');
const rootPackage = require(path.join(repositoryRoot, 'package.json'));
const generator = require('../src/service/tooling/defaultGovernanceReportGeneratorService');
const ownedDependencies = rootPackage.nodics.dependencyGovernance.ownedDependencies;

const modules = [
    {
        name: 'elastic',
        path: path.join(repositoryRoot, 'gFramework/nSearch/elastic')
    },
    {
        name: 'activemq',
        path: path.join(repositoryRoot, 'gFramework/nEms/activemq')
    },
    {
        name: 'paymentCore',
        path: path.join(repositoryRoot, 'gComm/payment/paymentCore')
    }
];

const matrix = generator.collectProviderCapabilityMaturitySummary(modules, ownedDependencies);
const elastic = matrix.find(entry => entry.modulePath === 'gFramework/nSearch/elastic');
const activemq = matrix.find(entry => entry.modulePath === 'gFramework/nEms/activemq');
const payment = matrix.find(entry => entry.modulePath === 'gComm/payment/paymentCore');

assert(elastic, 'Elasticsearch provider module must be present in the maturity matrix');
assert.strictEqual(elastic.displayName, 'Elasticsearch');
assert.strictEqual(elastic.providerBacked, true, 'Elasticsearch must be classified as provider-backed');
assert(elastic.evidence.dependencyPackages.some(item => item.packageName === '@elastic/elasticsearch'),
    'Elasticsearch maturity evidence must include the owned provider dependency');
assert(elastic.evidence.readme, 'Provider maturity evidence must include README presence');
assert(elastic.evidence.generatedContext, 'Provider maturity evidence must include generated context presence');
assert(elastic.evidence.sourceFiles > 0, 'Provider maturity evidence must include source file count');
assert(elastic.evidence.testFiles > 0, 'Provider maturity evidence must include test file count');

assert(activemq, 'ActiveMQ provider module must be present in the maturity matrix');
assert.strictEqual(activemq.providerBacked, true, 'ActiveMQ must be classified as provider-backed');
assert(activemq.evidence.dependencyPackages.some(item => item.packageName === 'stompit'),
    'ActiveMQ maturity evidence must include the owned provider dependency');
assert(String(activemq.maturity).toLowerCase().includes('placeholder'),
    'Placeholder provider maturity must not be promoted by scaffold ownership alone');

assert(payment, 'Payment capability module must be present in the maturity matrix');
assert.strictEqual(payment.displayName, 'Payment Core');
assert(payment.owns.includes('schema') && payment.owns.includes('service'),
    'Capability maturity evidence must include package ownership metadata');
assert(payment.evidence.sourceFiles > 0, 'Capability maturity evidence must include source file count');
assert(payment.evidence.testFiles > 0, 'Capability maturity evidence must include test file count');
assert(payment.maturity, 'Capability maturity must be explicitly inferred');

console.log('Governance report maturity matrix validated');
