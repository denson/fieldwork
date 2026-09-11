# Fieldwork Companion Pane — 0.8.0

Business Plan First Steps now supports a user-approved return handoff from chat to the website. When the matching guide emits a valid `business-plan-draft-v1` block, the extension replaces the technical block with a readable draft card. The visitor chooses **Use this draft**; only then does the extension place those values into the matching business-plan step in the paired website. Existing values in that step may be revised by this explicit action. The extension never submits a message or applies a draft without the visitor's click.

The return payload is limited to the known fields for one business-plan step, bounded to the same lengths and numerical ranges as the website, delivered only between the exact Business Plan First Steps chat and business activity in the same Chrome split view, and rechecked immediately before delivery. No draft content is stored by the extension or put into a URL. Reload the unpacked extension and then refresh both panes to enable this release.

# Public Fieldwork release — 0.6.0

Supports https://denson.github.io/fieldwork/ (tutorial, portfolio and all four activities) alongside the public weed guide and existing local development routes. No new permissions. Other projects on denson.github.io remain outside the bridge.

Reload the unpacked extension once after this code update, then refresh both ordinary pages. Site content changes and bot instruction changes do not ordinarily require an extension update. This release moves the activity links to GitHub Pages; no local server is needed to use the public portfolio. The historical test records below predate publication.

# Fieldwork Companion Pane — 0.5.1

An unpacked Chrome extension for the local Fieldwork portfolio and public Colorado Weed Field Guide. Chrome 140 or later.

## Two directions

- Website to BoodleBox: review a prepared practice or lesson note and click **Put note in BoodleBox**. The extension fills the paired matching guide's empty message box. Review it and press Send yourself. It does not submit automatically, overwrite an existing draft, or create a chat to deliver a note.
- BoodleBox to website: click a local Fieldwork activity link in the chat. The existing Fieldwork pane beside that chat opens the destination. Copy link buttons remain available beside those links.

## Install or update

1. Open chrome://extensions in Chrome and enable Developer mode.
2. For a new installation, choose Load unpacked and select `C:\claude_projects\boodlebox-demo\chrome-extension`.
3. For an existing installation, click the card's Reload arrow. Chrome's Update button also reloaded this unpacked extension during the September 6 live tests.
4. Reload **both** BoodleBox and the Fieldwork website. Keep the local server running on port 4173.
5. Keep a conversation with the matching companion beside its activity in Chrome split view.

Website content and published bot edits do not require an extension update. Update the extension only when files inside chrome-extension change; then refresh both ordinary pages. Version 0.4.1 maps the bare website homepage to First Steps while keeping ?demo=home as the portfolio.

The new button appears on First Steps' Share screen and the four subject lessons' prepared-note dialog. Without the extension, copy/paste still works. Notes longer than 32,000 characters use the copy fallback. A popup toggle disables both directions.

## Boundaries

Targeting uses the same splitViewId and windowId, rechecked before delivery/navigation. A note goes only to an existing matching guide's conversation in the paired pane, top frame, with its current URL checked again. A nonempty draft is preserved; an attachment-only draft indicated by an enabled Send button is also left alone. A repeated click on an already placed note does not duplicate it. The extension does not read the conversation transcript; it checks the current composer label/content and send control. It uses BoodleBox's normal paste handler to prepare a draft and confirms the note's text, line boundaries, and enabled Send control. The learner always submits.

For chat links, an existing supported activity, Chrome New Tab page or Chrome split-view Choose a tab page is reused in the same paired pane. An unrelated neighboring website is preserved; a new activity tab opens instead. A pane navigating or changing pairing is left alone. Modifier-clicks retain their normal browser behavior. NOAA and USGS source links remain normal links.

No extension backend, telemetry, API keys, or model upgrade. The extension makes no direct external network requests and stores no note text. Host permissions cover https://box.boodle.ai, the local Fieldwork origins http://127.0.0.1:4173 and http://localhost:4173, and https://denson.github.io. Content-script matching and routing restrict public activity targets to /fieldwork/ and /colorado-weed-field-guide/. Local storage keeps the enabled setting. Session storage briefly holds a pending lesson transition (tab IDs, approved destination, one-use token, and a 60-second expiry); it stores no note text. Version 0.5.1 adds tabs permission so Chrome exposes the address of its own blank split-view chooser; without this, an unknown URL could be either an empty pane or an unrelated website. Tab metadata is used locally to identify the exact paired pane. This permission does not inject content scripts into other sites or read their page contents. See Chrome's Tabs API permission documentation linked below.

## Validation on September 6, 2026

- Routing and service-worker tests: `node ../portfolio/tests/extension.test.cjs`.
- Note targeting, navigation races, sender/frame/origin/payload boundaries, existing-draft and duplicate protection, app acceptance, no automatic send: `node ../portfolio/tests/extension-notes.test.cjs`.
- LIVE Chrome split view: Put note in BoodleBox placed the exact First Steps Lantern/earthquake note in the existing paired chat, with line boundaries preserved and Send enabled. No message was submitted. Repeated click reported already ready; a separate unsent draft was preserved. The return link navigated the existing right pane to Return without opening another activity tab.
- First Steps is live-tested. The shared lesson-dialog integration is implemented but has not been individually exercised with all four companions. A later BoodleBox editor change can require adapting the DOM selectors/paste handler; failures report an unconfirmed draft rather than claiming success.

Primary references: https://developer.chrome.com/docs/extensions/reference/api/tabs , https://developer.chrome.com/docs/extensions/develop/concepts/messaging , https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts .


## Start the next lesson in both panes (0.3.0)

At the end of First Steps, **Open the portfolio** opens Portfolio Guide and the activity menu in the existing Chrome split view. Choosing an activity there opens its matching companion and website. An explicit subject lesson link clicked in BoodleBox also opens its matching pair. When already on a subject website, its matching companion-profile link opens that guide in the paired left pane.

The extension uses the published bot profile and its visible **Start New Chat** button. It waits for the matching guide's composer in a new conversation before opening the lesson on the right. A matching guide already in the left pane is reused. Existing conversations remain in BoodleBox history. A nonempty draft or unavailable chat blocks changing companions. The extension never sends a learner note automatically; pressing Start authorizes creating the new conversation (BoodleBox supplies its normal initial greeting).

Transitions are restricted to the four known subjects/companions and approved local activity paths. Source and destination tabs must remain paired, and the website must remain at its original URL until the new guide is ready. A session intent expires after 60 seconds and can authorize Start New Chat only once. Unexpected navigation, changed pairing, disabled settings, or a wrong guide cancels the transition. If BoodleBox cannot finish the new chat, the website remains at the original activity and the visible Start New Chat button is a manual fallback.

Run `node ../portfolio/tests/transition.test.cjs` for the transition state and guard checks. The original note and link routing suites also pass with this version. Live installation verification is recorded in the project transition handoff.

Live transition verified September 6: the First Steps Start activity with guide button opened Community Budget Coach in a new conversation in the existing left tab and the budget lesson in the same right tab. Old chat remained in history. Version 0.3.1 restricts launch-control insertion to actual activity slots, removing an extra button caused by the document capability marker.


Version 0.4.0 adds the shared Fieldwork Portfolio Guide, paired Home/First Steps routing, and website activity/portfolio links that switch both panes. Reload this unpacked extension with Chrome’s Update button, then reload both ordinary pages.

## Version 0.5.0 — public Colorado Weed Field Guide

Adds https://denson.github.io/colorado-weed-field-guide/ and ColoradoWeedGuide. Chrome host permission covers denson.github.io; content-script matching and routing restrict operation to this project path. Other projects on that host are not activity targets. Static references and visitor observations can be placed in an empty paired draft; Send remains a deliberate user action. No new permissions beyond storage and the added host. Reload the unpacked extension once for this release; ordinary plant-content changes do not require extension updates. Automated routing, note, and transition checks pass. Live public-site verification recorded in the project handoff.

## Version 0.5.1 — reuse a blank split pane

Recognizes chrome://tab-search.top-chrome/split_new_tab_page.html, Chrome New Tab URLs and about:blank as empty companion panes. Tabs permission makes their URLs available to the extension. Both same-guide navigation and a change to the matching guide can start from an empty pane. Navigation is rechecked immediately before changing the right pane; a changed or loading page cancels the operation. Unknown addresses, settings pages and unrelated websites are never classified as blank. Regression tests cover the exact reported chooser URL, no extra tab creation, matching/new-guide flows and navigation races.
