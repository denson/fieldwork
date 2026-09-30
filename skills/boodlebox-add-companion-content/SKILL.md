---
name: boodlebox-add-companion-content
description: Add or move a BoodleBox guide and Fieldwork companion page without changing the Chrome extension for each new lesson.
---

# Add companion content without an extension release

Use this when creating or moving a BoodleBox guide paired with a page on an origin already approved by the Fieldwork Companion Pane extension. A chat-only guide needs no pairing entry.

The extension contains approved website boundaries and the transfer protocol. The website owns the activity-to-guide mapping in `portfolio/companion-registry.json`. Do **not** add a lesson path, bot alias, or display name to extension source. An extension update is warranted only when an origin, permission, transfer protocol, or security behavior actually changes.

1. Decide whether the experience is chat only, workspace only, or paired. For a paired experience, publish a working page and a visible link to its actual BoodleBox profile. Mark guide links `data-fieldwork-open-guide` and activity links `data-fieldwork-combo`. Keep ordinary links and copy/paste usable when the extension is absent.
2. Add or change the route in the website registry. Use `site: "fieldwork"` for a page under `https://denson.github.io/fieldwork/`; use `site: "plants"` for the existing Colorado Plants project. `path` is the page path **within** that project. Use `demo` only for the shared `index.html` experience. Supply the published profile's exact `alias` and its visible BoodleBox `name`. Set `launch: true` on one canonical route per guide if the extension may open that workspace from chat. Do not use a broad prefix for a new lesson when one page is enough.
3. Put the actual published page link in the bot's greeting/instructions and dated knowledge snapshot. BoodleBox does not gain access to website content by seeing a link; attach the Markdown it needs. Update the portfolio card, any related guide listings, and the evaluation ledger. Keep bot-only and workspace-only variants distinct where both exist.
4. Publish the website and registry together. The extension refreshes the JSON registry from the approved Fieldwork origin and uses its last valid copy if temporarily offline. Reload both panes after publication; if a mapping was just changed, allow up to 30 seconds for refresh. A missing or invalid registry must not silently route to an unrelated guide.
5. Test a fresh chat opening the page, the page opening the guide, a reviewed note placed in the matching chat, and manual copy/paste. Test a blank split pane, an existing matching pane, an unrelated neighboring page, and an ordinary tab. Confirm no note is sent automatically and no unrelated page is replaced. Record which live checks were actually performed.

For a new website origin, Chrome host permissions and content-script matches may require a deliberate extension update; this skill does not bypass that boundary. Do not claim an extension update is needed merely because a page path or bot was added under an already approved site.
