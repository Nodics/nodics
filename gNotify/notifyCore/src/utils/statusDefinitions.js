/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module notifyCore/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
  ERR_NOTIFY_00001: { code: '403', message: 'Notification authorization or mutation boundary denied' },
  ERR_NOTIFY_00002: { code: '400', message: 'Notification request or relationship is invalid' },
  ERR_NOTIFY_00003: { code: '429', message: 'Notification rate limit exceeded' },
  ERR_NOTIFY_00004: { code: '404', message: 'Notification template version is unavailable or ambiguous' },
  ERR_NOTIFY_00005: { code: '400', message: 'Notification context or template relationship is invalid' },
  ERR_NOTIFY_00006: { code: '400', message: 'Notification content cannot be rendered safely' },
  ERR_NOTIFY_00007: { code: '503', message: 'No healthy notification provider account is available' },
  ERR_NOTIFY_00008: { code: '400', message: 'Notification evidence is prohibited or excessive' },
  ERR_NOTIFY_00009: { code: '503', message: 'Notification Pipeline runtime is unavailable' },
  ERR_NOTIFY_00010: { code: '409', message: 'Notification retry is not permitted' },
  ERR_NOTIFY_00011: { code: '400', message: 'Notification verification request is invalid' },
  ERR_NOTIFY_00012: { code: '409', message: 'Notification template lifecycle operation conflicts' },
  ERR_NOTIFY_00013: { code: '400', message: 'In-app notification acknowledgement is invalid' },
  ERR_NOTIFY_00014: { code: '403', message: 'Notification test-send policy denied the request' },
  ERR_NOTIFY_00015: { code: '400', message: 'Notification provider account governance failed' },
};
