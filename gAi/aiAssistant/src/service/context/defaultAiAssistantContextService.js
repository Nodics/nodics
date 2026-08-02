/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/service/context/DefaultAiAssistantContextService
 * @description Builds bounded provider context while preserving security instructions and citations.
 * @layer service
 * @owner aiAssistant
 * @override Projects may replace summarization while preserving governed context.
 */
module.exports = {
    /** Selects recent history inside configured bounds without mutating persisted messages. */
    optimizeHistory: function (messages, configuration) {
        const maximum = configuration.contextOptimization.maximumHistoryTokens;
        let used = 0;
        const selected = [];
        (messages || []).slice().reverse().some(message => {
            const estimate = Math.ceil(Buffer.byteLength(String(message.content || ''), 'utf8') / 3);
            if (used + estimate > maximum) return true;
            selected.unshift({ role: message.role, content: message.content });
            used += estimate;
            return false;
        });
        return { messages: selected, estimatedTokens: used, truncated: selected.length < (messages || []).length };
    },

    /** Assembles immutable provider input with mandatory prompt and evidence. */
    assemble: function (input) {
        if (!input.instructions) throw new Error('AI Assistant requires approved prompt instructions');
        const knowledgeInstructions = input.knowledgeInstructions ?
            '\n\n' + input.knowledgeInstructions : '';
        const result = {
            instructions: input.instructions + knowledgeInstructions,
            messages: input.history.messages.concat([{ role: 'user', content: input.message }]),
            evidence: input.evidence || [],
            knowledgeContext: input.knowledgeContext,
            authorization: input.authorization,
            tools: input.tools || []
        };
        return Object.freeze(result);
    }
};
