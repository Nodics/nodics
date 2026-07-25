/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiProviders/test/aiProviderDocumentationContract
 * @description Ensures local and public AI ledger guidance remains discoverable and covers mandatory audiences and use cases.
 * @layer test
 * @owner aiProviders
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../..');
function read(relativePath) {
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
}
function includesAll(relativePath, clauses) {
    const content = read(relativePath);
    clauses.forEach(clause => assert(content.includes(clause),
        relativePath + ' must preserve documentation contract clause: ' + clause));
}

includesAll('gAi/aiProviders/docs/persistent-token-ledger-guide.md', [
    '## Who This Guide Is For',
    '## Ownership And Source Map',
    '## Administrator Configuration',
    '## Roles And Permissions',
    '### Use Case 1: Successful Employee Request',
    '### Use Case 2: Duplicate Browser Retry',
    '### Use Case 3: Unauthorized Operator',
    '### Use Case 4: Concurrent Budget Boundary',
    '### Use Case 5: Failure Before Provider Invocation',
    '### Use Case 6: Timeout After Provider Invocation',
    '### Use Case 7: Partner Customization',
    '## Security And Privacy',
    '## Performance And Scale',
    '## Observability',
    '## Deployment And Topology',
    '## Backup, Restore, And Migration',
    '## Troubleshooting',
    '## Developer Extension Checklist',
    'bounded transitional-state repair',
    'automatic provider lookup',
    '### Preview Or Apply Repair',
    '### Reconcile Positive Provider Evidence',
    '### Manual Approval Mode',
    '`ai.ledger.repair.approve`'
]);

includesAll('gDocs/ai/how-ai-cost-governance-works.md', [
    '## Why A Business Needs This',
    '## A Simple Example',
    '## What Administrators Can Do',
    '## Security And Accuracy',
    '## Important Current Limitations',
    '## For Developers',
    '## Continue'
]);

includesAll('gAi/aiProviders/AGENTS.md', [
    'Persistent `aiTokenBudget`, `aiTokenReservation`, and `aiTokenUsageRecord`',
    'Cache data is diagnostic acceleration only',
    'Usage records are immutable audit evidence',
    'Transitional states must be repairable'
]);

console.log('AI Provider distributed documentation contract validated');
