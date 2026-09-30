---
name: boodlebox-convert-experience
description: Convert a BoodleBox standalone bot into a bot-plus-website experience, or make a website-paired guide work independently in chat while preserving the task and output.
---

# Convert a BoodleBox experience

Preserve the user's underlying task across both formats. Write down the inputs, source material, decisions, output, and checks that make a result acceptable. Then choose what belongs in chat and what benefits from a page. Do not let a presentation change silently narrow the task.

## Chat-only to companion website

Keep chat-only use available only when it remains a complete, tested mode; it may use the same bot or a separate bot. Move the parts that genuinely benefit from visual inspection, editable fields, calculation, comparison, backup, or export to the page. Add an explicit, reviewed handoff: what the bot proposes, what the page accepts, how the person changes or declines it, and how a saved prior version can be restored when a revision replaces work. Distinguish the paired task from any complete chat-only task. If the Fieldwork extension is part of the requested pair, use `$boodlebox-companion-workspace` for its exact routing and pairing checks.

## Companion website to chat-only

Create a complete chat-only mode in the same bot or a separate bot. Inventory what the site supplies that a chat visitor will lose: source text, examples, calculations, state, visual evidence, and exports. Move essential facts and examples into readable BoodleBox knowledge with provenance; do not rely on the bot opening a URL. Translate controls into short conversational choices and a complete copyable result. For calculations or validation that cannot be reproduced reliably in chat, provide a bounded manual method or flag the item for review rather than fabricating a result. Use `$boodlebox-standalone-bot` to test that a new visitor can finish without the site or extension. Until the chat-only mode passes its own published test, do not call it complete.

## Both directions

Describe each offered mode clearly so the visitor knows whether a website or bot is optional or part of that flow. Test the same realistic case through each offered mode and compare the resulting facts, unknowns, and next step; differences in presentation are fine, lost essential information is not. Include a user correction, an early request for the deliverable, and a return after interruption. Preserve user work and do not automatically send a chat message, form, or email during conversion. For an AI-ready workspace, test its discovery entry and readable references separately from page interaction.
