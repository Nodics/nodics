/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/data/core/data/jobs/DefaultAiAssistantJobsData
 * @description Contributes the inactive OOTB Assistant abandoned-turn recovery schedule.
 * @layer data
 * @owner aiAssistant
 * @override Operations may activate, assign, or reschedule this job while CronJob remains execution authority.
 */
module.exports = {
    turnRecovery: {
        code: 'aiAssistantTurnRecoveryJob',
        description: 'Reconciles a bounded batch of abandoned AI Assistant turns',
        runOnNode: 'node0', runOnInit: false,
        active: false, logResult: true, priority: 550, status: 'NEW', state: 'NEW',
        jobDetail: {
            internal: {
                module: 'aiAssistant', method: 'POST',
                uri: '/internal/assistant/turns/recover',
                timeoutMs: 30000
            }
        },
        trigger: { expression: '0 */2 * * * *' }
    }
};
