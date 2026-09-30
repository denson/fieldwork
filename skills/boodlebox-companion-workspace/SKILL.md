---
name: boodlebox-companion-workspace
description: Build or improve a BoodleBox guide paired with a website workspace, including agent-readable lesson knowledge, navigation, and reviewed handoff between chat and page.
---

# BoodleBox companion workspace

Give chat and page distinct jobs. The BoodleBox guide converses, explains, and drafts in plain text. The website owns visual examples, forms, calculations, comparison, persistence, and export. A person should understand the task before seeing controls, and should be able to review every proposed change.

Define the intended modes explicitly: bot only, workspace only, or bot plus workspace. A workspace may be complete without BoodleBox and may work with other AI agents. If a paired mode requires the workspace and a visitor cannot access it, say that mode cannot be completed and offer a working link or a manual transfer method. Do not claim a chat-only mode is complete merely because the bot can answer questions or make a partial draft. A complete chat-only mode may be in the same bot or a separate bot, but it needs its own end-to-end test.

When the intended workspace should also work with Codex, Claude, or other agents, publish an agent guide at the site that gives them the equivalent task knowledge, source boundaries, teaching or workflow rules, and output standards supplied to the BoodleBox bot. Adapt platform-specific instructions instead of copying them verbatim: BoodleBox needs an attached knowledge snapshot and may use the Fieldwork extension for a reviewed handoff; a browser-capable agent can inspect and operate the website directly with the user's authorization and must not depend on that extension. An agent without browser access can still work from the published guide and a note the person deliberately shares, but cannot claim to see live page state. Keep the published guide and bot knowledge aligned when either changes; a Markdown mirror of every visual page is optional.

Make the agent guide discoverable from the activity page itself through a visible link and, where useful, a document link in the page head or a project-local `llms.txt`. Do not assume an agent will guess the project path or search for `llms.txt` after a general request to open the page. If the host makes raw Markdown download instead of display in a browser, provide a browser-readable page containing the same guide and keep it synchronized with the Markdown source. Check the links and content under the intended public, authenticated, or private deployment. Test a BoodleBox-guided task and the same task with an outside agent starting from the website URL; verify what each can actually read, operate, and complete. An AI-facing reference alone does not prove browser operation.

Document BoodleBox and workspace access separately. Record who can use the bot, whether its instructions and attached knowledge are deliberately published, who can load the website and agent-readable files, and which MCP/API endpoints require authorization. Do not equate an unpublished bot attachment with a secret, or public browser-delivered code with private knowledge. Treat unknown sharing, remix and backend settings as unverified until checked.

## Contract between chat and page

- Define exactly what moves in each direction, the format, the recipient, and the person's approval step. Distinguish preparing a draft, placing it in a composer, applying it to the page, and actually sending or submitting it. Never claim an action happened merely because a link opened.
- Keep the site usable without a live BoodleBox connection when feasible. Provide a manual copy/paste route when automatic pairing is unavailable; this is a fallback for the extension, not permission to omit a required workspace. Preserve existing user text; never overwrite an unfinished chat draft or website work silently.
- The bot cannot infer live website state from a link. Supply necessary page facts as knowledge or through a verified handoff. The page must validate any returned text and mark unsupported or missing information for review.
- Present the website link clearly in the bot's opening message. Explain the optional split-view workflow accurately for the installed extension; do not promise that right-clicking a link will pair the pages. Keep the page's own introduction about the user's task rather than installation mechanics. Put a visible link to the matching guide on the page itself.

## Fieldwork extension integration

When working in the Fieldwork repository, use the website-owned `portfolio/companion-registry.json` for page-to-guide pairing. Follow [Add companion content without an extension release](../boodlebox-add-companion-content/SKILL.md). Do not add lesson paths or bot aliases to the extension. Mark each actual page-to-guide anchor with `data-fieldwork-open-guide`, including links created by page JavaScript. The guide link must route through `fieldwork-open-guide`; `fieldwork-launch` is for activity links and can consume a guide click without opening anything. Test **both entry points**: click the page link in a matching BoodleBox chat, then click the guide link on the website. For each, test a blank paired pane, an existing matching pane, an unpaired tab, and an unrelated neighboring page. The guide link must open in the paired pane when available and a new tab otherwise; a `target="_blank"` link alone does not guarantee pairing. Test actual clicks with and without the marker, and preserve ordinary navigation when the extension is absent or disabled. An extension release is needed for a new origin, permission, transfer protocol, or security behavior, not for another lesson page on an approved site.

Use only permissions the feature needs. Treat webpage text, chat messages, and pasted drafts as untrusted input; validate origin, path, guide identity, pair, payload, and current tab state before transfer. A user gesture should initiate each transfer. Keep send or submit under the person's control.

## Verify the experience

Test the published bot and deployed page together, including the actual installed extension version if accessible. Check first visit, split and ordinary tabs, manual fallback, interrupted navigation, an unfinished draft, and the final reviewed output. If live extension behavior could not be exercised, report that limit explicitly rather than calling the pair fully tested.
