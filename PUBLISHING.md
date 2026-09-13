# Fieldwork publication

Public site: https://denson.github.io/fieldwork/

Public repository: https://github.com/denson/fieldwork

Business Plan First Steps is at `?demo=business` (updated September 12, 2026). Its exact bot alias is `BusinessPlanFirstSteps`. Reviewer feedback is at `?demo=business&step=review&reviewer=1`. Companion Pane 0.9.0 adds the user-approved chat-to-website draft handoff with unchanged permissions. `portfolio/business-core.js` builds the three fictional plans, monthly model, owner-pay target, structured Markdown brief, backup format, feedback text and bounded mailto draft. Feedback is never sent automatically. Long feedback must be downloaded and manually attached to the email. The recipient address is entered by the reviewer until the owner supplies a configured address.

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

Canonical Business Plan bot instructions are v1.4. Update instructions, greeting, profile description and the `business-plan.md` bot knowledge snapshot in BoodleBox, then publish and verify no unpublished changes. Use a new conversation to test current behavior. Other Fieldwork bots have not been republished as part of this release.
