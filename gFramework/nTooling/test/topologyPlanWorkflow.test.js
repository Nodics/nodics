/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTooling/test/topologyPlanWorkflow
 * @description Verifies approval-first topology planning and applied topology generation against the structure compliance audit.
 * @layer test
 * @owner nTooling
 * @override Project topology workflows may extend these fixtures while preserving no-write-by-default planning and explicit apply behavior.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const topologyPlanService = require('../src/service/generation/defaultTopologyPlanService');
const structureComplianceQualityService = require('../src/service/quality/defaultStructureComplianceQualityService');

const projectHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-topology-plan-'));
try {
    const planOnlyOptions = topologyPlanService.createOptions([
        '--name=acme',
        '--path=' + path.join(projectHome, 'acme'),
        '--groupName=acmeGroup',
        '--modules=acmeCore,acmeApi',
        '--providers=oracleProvider',
        '--envs=local',
        '--servers=apiServer',
        '--nodes=node0,node1'
    ]);
    const planOnly = topologyPlanService.createPlan(planOnlyOptions);
    assert.strictEqual(planOnly.apply, false, 'Topology planning must be no-write by default');
    assert.strictEqual(fs.existsSync(path.join(projectHome, 'acme')), false,
        'Plan-only topology command must not write project files');
    assert(planOnly.entries.some(entry => entry.kind === 'server' && entry.activeModules.includes('acmeCore')),
        'Topology plan must show server active module placement');
    assert(planOnly.validations.includes('npm run structure:audit -- --fail'),
        'Topology plan must include structure audit validation');

    const applyOptions = Object.assign({}, planOnlyOptions, { apply: true });
    const appliedPlan = topologyPlanService.createPlan(applyOptions);
    topologyPlanService.applyPlan(appliedPlan);

    const report = structureComplianceQualityService.collectReport({
        rootDir: projectHome,
        includeInfo: false
    });
    assert.strictEqual(report.errorCount, 0, 'Applied topology must not contain structure audit errors');
    assert.strictEqual(report.warningCount, 0, 'Applied topology must not contain structure audit warnings');

    const serverProperties = fs.readFileSync(path.join(projectHome,
        'acme/envs/local/apiServer/config/properties.js'), 'utf8');
    assert(serverProperties.includes('activeModules'),
        'Applied server topology must own activeModules in server config/properties.js');
    assert(serverProperties.includes('acmeCore'),
        'Applied server topology must include planned capability modules in activeModules');
    assert(fs.existsSync(path.join(projectHome, 'acme/modules/oracleProvider/src/service/defaultSampleService.js')),
        'Applied topology must generate provider service scaffold');
} finally {
    fs.rmSync(projectHome, { recursive: true, force: true });
}

console.log('Nodics topology plan workflow validated');
