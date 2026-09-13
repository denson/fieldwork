# Fieldwork publication

## September 13 connection and client-facing copy update

Current extension: Companion Pane **0.10.0**. Current Business Plan bot instructions: **v1.7**. Publish the exact LF-normalized `portfolio/lessons/business-plan-boodlebox-configuration.txt`; it includes every current example field and stays below 49,000 characters before the builder's rich-text formatting. Keep the existing greeting and description. The bot defaults to chat, uses manual copy/paste when the workspace connection is unconfirmed, and supplies transfer cards only after the visitor shares a connection check and chooses the workspace. A request to return to chat overrides an earlier connection report.

The extension verifies the exact paired guide/workspace, presents visible mode choices, preserves unsent messages and attachments, and never presses Send. Status and choices are shared through the existing message composer, not a private BoodleBox integration. The site and published bot cannot update the installed extension; reload version 0.10.0 and both ordinary pages to enable the controls. Read the extension README for update details and validation limits.

The business example catalog and workspace now address the business owner. Meeting-specific Allan copy and duplicate links opening another Business Plan bot chat were removed. Historical handoff records and private meeting guides retain their context. Updated business UI/CSS asset queries are `20260913-connection`; unchanged example/core assets remain `20260913-library`.

Public site: https://denson.github.io/fieldwork/

Public repository: https://github.com/denson/fieldwork

Business Plan First Steps is at `?demo=business` (updated September 12, 2026). Its exact bot alias is `BusinessPlanFirstSteps`. Reviewer feedback is at `?demo=business&step=review&reviewer=1`. Companion Pane 0.9.0 adds the user-approved chat-to-website draft handoff with unchanged permissions. `portfolio/business-core.js` builds the five fictional plans, monthly model, owner-pay target, structured Markdown brief, backup format, feedback text and bounded mailto draft. Feedback is never sent automatically. Long feedback must be downloaded and manually attached to the email. The recipient address is entered by the reviewer until the owner supplies a configured address.

The repository's `portfolio/` directory is the GitHub Pages artifact. Root project research, meeting notes, bot setup logs, temporary scripts and downloaded template bundles are excluded from Git. Keep the explicit `.gitignore` allowlist when adding files. Website source and the extension remain in their original local directories.

Push reviewed changes to `main`. The Pages workflow runs all activity and extension tests before deployment. No local preview server or separate backend is needed for visitors.

When changing a JavaScript or CSS file, also update its version query in the HTML entrypoints that load it. GitHub Pages serves assets with a cache lifetime, so changing a file without changing its asset URL can leave existing visitors running the old copy. For a reported stale-page problem, check the exact loaded asset URL and verify the corrected content in the existing user tab after publication; a successful deployment alone does not verify that tab. Preserve the page URL and tab-local draft when reloading.

The tutorial is the plain homepage. Use `?demo=home` for the portfolio, or `?demo=history`, `?demo=quakes`, `?demo=budget`, `?demo=hearing` for a subject. Keep `/fieldwork/` in all public links.

Public bot references and current instruction sources live in `portfolio/lessons/`. Publish changed bot instructions/greetings separately in BoodleBox. A website update does not automatically change a bot's attached reference snapshot or its instructions.

Companion Pane 0.9.0 supports this public address, the existing public Colorado Weed Field Guide and local development addresses. Reload an unpacked extension after its code changes, then refresh both normal pages. Ordinary site content and bot instruction changes do not require an extension reload.


## September 12 first-draft release

Business Plan First Steps now opens with an invitation to explore an idea, two prominent examples (Mesa Yard Care and SafeStart Property Testing), and an always-available brief. Bicycle tune-ups remain an additional example. Selecting an example opens the idea step. Save and restore controls sit below the workspace.

The seven-stage model adds `rules` between `offer` and `numbers`, with `checks`, `verifier`, and `impact` fields. Older tab/device drafts and JSON backups preserve their existing answers and load these fields as blank. Costs remain in the existing startup/per-sale/monthly totals; verification notes never automatically add money. Notes carry relevant verification context into offers, numbers, next tests and review.

Companion Pane 0.9.0 accepts rules-step drafts without new permissions and still accepts v1 payloads for older stages. Update the existing unpacked extension folder and reload it in Chrome, then refresh both paired pages. Website changes alone cannot update an installed extension.

## September 13 business-plan library

The new selection page is https://denson.github.io/fieldwork/business-plans.html . The portfolio's business links point there; existing `?demo=business` workspace links still work. Five examples cover scheduled local services, consulting, physical products, mobile repairs and specialist technical projects. `business-examples.js` is the shared data source for the catalog and planner. Load it before `business-core.js` in planner entrypoints.

`?demo=business&example=yard|consulting|toys|bike|property|own` selects a starting draft and opens idea. The choice is consumed once. The existing confirmation dialog protects saved work, including gap-only notes; cancel retains the old draft. Never put private plan answers in a URL.

Six optional gap-review topics live in the brief. Findings are bounded to 1000 characters per topic. “Evidence recorded” requires a note and is explicitly self-reported. Backups and tab/device saves preserve findings and status; older drafts get open topics. Automatically calculated money/capacity concerns remain separate. Markdown, print and the shared review note include findings; the shared note abbreviates long text. All ordinary extension transfer fields are unchanged, so no extension update is required for this release. Gap findings are edited on the site or manually pasted from chat; do not add them to draft-transfer JSON.

The consulting and toy examples adapt the SBA's fictional Rebecca and Andrew examples. Andrew's lean and traditional samples describe the same business. Current scopes, operating details, calculator inputs and review questions are Fieldwork teaching additions. The other three examples are original Fieldwork work. Source links and limits appear in the catalog and briefs. No Bplans text is reused. No dated market or regulatory claim from the SBA samples is treated as current evidence.

Canonical Business Plan bot instructions are v1.6. Business Plan First Steps still supports a complete chat experience and optional website support; other bots retain their existing website activities. Publish the exact `portfolio/lessons/business-plan-boodlebox-configuration.txt` in BoodleBox's Instructions field, plus the separate greeting and profile description. This checked-in configuration combines the behavior instructions with a compact authoritative appendix containing every current example field and its key gaps. It is below the builder's 50,000-character limit; tests check the limit and every example field. Do not concatenate the full `business-plan.md` with the instructions: the expanded public reference is too large for that field.

Keep the full public reference and compact configuration aligned when examples change. The older attached knowledge snapshot remains in BoodleBox and is explicitly superseded by the included current reference. No attachment deletion or upload is needed. Verify saved content and no unpublished changes after publishing. Other Fieldwork bots are outside this release.
