# Fieldwork publication

Public site: https://denson.github.io/fieldwork/

Public repository: https://github.com/denson/fieldwork

Business Plan First Steps is at `?demo=business` (September 9, 2026). Its exact bot alias is `BusinessPlanFirstSteps`. Companion Pane 0.7.0 adds the mapping with unchanged permissions. `portfolio/business-core.js` builds the monthly model, draft, feedback text and bounded mailto draft. Feedback is never sent automatically. Long feedback must be downloaded and manually attached to the email. The recipient address is entered by the reviewer until the owner supplies a configured address.

The repository's `portfolio/` directory is the GitHub Pages artifact. Root project research, meeting notes, bot setup logs, temporary scripts and downloaded template bundles are excluded from Git. Keep the explicit `.gitignore` allowlist when adding files. Website source and the extension remain in their original local directories.

Push reviewed changes to `main`. The Pages workflow runs all activity and extension tests before deployment. No local preview server or separate backend is needed for visitors.

When changing a JavaScript or CSS file, also update its version query in the HTML entrypoints that load it. GitHub Pages serves assets with a cache lifetime, so changing a file without changing its asset URL can leave existing visitors running the old copy. For a reported stale-page problem, check the exact loaded asset URL and verify the corrected content in the existing user tab after publication; a successful deployment alone does not verify that tab. Preserve the page URL and tab-local draft when reloading.

The tutorial is the plain homepage. Use `?demo=home` for the portfolio, or `?demo=history`, `?demo=quakes`, `?demo=budget`, `?demo=hearing` for a subject. Keep `/fieldwork/` in all public links.

Public bot references and current instruction sources live in `portfolio/lessons/`. Publish changed bot instructions/greetings separately in BoodleBox. A website update does not automatically change a bot's attached reference snapshot or its instructions.

Companion Pane 0.6.0 supports this public address, the existing public Colorado Weed Field Guide and local development addresses. Reload an unpacked extension after its code changes, then refresh both normal pages. Ordinary site content and bot instruction changes do not require an extension reload.
