---
name: boodlebox-standalone-bot
description: Create or improve a BoodleBox bot that completes its task entirely in chat, without depending on a companion website or browser extension.
---

# BoodleBox standalone bot

Build a usable chat experience for a person arriving with no prior context. The bot must introduce the task, present any material the person needs, guide one meaningful step at a time, and produce a result they can keep. A linked website can be optional reading; opening its URL does not give the bot its contents.

Do not reclassify a workspace-designed guide as standalone because it can answer questions or produce a partial draft in chat. A chat-only mode can share a bot with a workspace mode or use a separate bot; either way it must contain the necessary knowledge and pass an end-to-end test without the workspace. A workspace-only output is also valid and need not have a BoodleBox bot.

## Design

- Define the audience, task, source material, output, and standard for a good result before writing instructions. The first message should say what the person will do and offer a clear way to begin. Do not open with an unexplained test or internal terminology.
- Put essential source content into BoodleBox knowledge as text or Markdown that the bot can actually use. Include source title, link, version or retrieval date where relevant. For a fixed-document lesson, keep the bot anchored to that document; a link is for the human to open in a tab or split view, not a substitute for knowledge. Do not ask the person to supply a different document unless that is the chosen product.
- For calendars, tables, or multicolumn documents, visually check the extraction against the source before attaching it. Keep structured text with page/section provenance and exact date-to-entry relationships; preserve blank entries and printed inconsistencies instead of silently repairing them. Distinguish "not listed" from a stated closure. Retrieve the exact requested section even when correcting a premise or refusing a request; a sound refusal can still contain wrong source facts. Never infer contents of an unavailable reverse side or missing page.
- Teach before assessing when the task is educational. Let the person skip to a test, give feedback against the supplied material, remember difficulties within that chat, and offer targeted practice. Explain technical terms when they first matter; allow intuition before mathematics.
- Keep the deliverable complete in chat: a brief, checklist, email text, answer with evidence, or other copyable output. Mark unknowns and unverified claims. Never imply the bot searched, read a link, accessed an account, or completed an action unless an available tool actually did so.
- Use concise text and ordinary links. Keep rich visuals, forms, and controls out of bot messages. If a linked document matters, show its link prominently once at the right moment and repeat only on request. A thumbnail is optional, not a prerequisite to understanding the task.
- When a portfolio lists the bot, classify it by whether the task can actually be completed in chat. A useful draft is not a tested demo: keep untested, tested, and failed status tied to observed sessions. If a page is required to finish, use the companion-workspace skill instead.
- Choose among models actually available in BoodleBox by testing task quality and cost; do not hard-code a model name into public copy. Account and coaching modes can vary by user and should not be mistaken for bot instruction behavior.

## Build and verify

Maintain exact editable versions of the greeting, instructions, and attached knowledge alongside the project when there is one. Record the configuration tested: version or snapshot identifier, model shown, account/coaching modes, and draft or published status. Keep exact test inputs and outputs with observed failures, source references, and actual chat URLs when available; if no URL was captured, say so. Keep credentials and personal addresses out of public records.

Test in a fresh or cleared chat: greeting; vague or wrong first answer; a missing fact; source question; request for the result early; and a full completion. For source-based bots, include exact retrieval and unsupported-premise cases. Record a failure before repairing it. After any knowledge, instruction, greeting, or model change, clear the chat and rerun the failed case, core task regressions, and a held-out case. Tie the final result to that exact version; passes from earlier versions do not establish a final-version pass. Summarize observed results and pending checks in [the evaluation ledger](../../portfolio/BOT-EVALUATIONS.md), linking the detailed evidence rather than inventing sessions.

Publish only when the user has authorized publication to the intended audience; account access and this skill do not grant sharing permission. Otherwise, keep a draft preview and explicitly mark published-version and fresh-visitor checks pending. When publication is authorized, confirm the published version through the core checks as a new visitor, distinguish author-account tests from separate-recipient tests, and return the actual bot link and observed limitations. Do not call a builder-preview pass a published or recipient pass.
