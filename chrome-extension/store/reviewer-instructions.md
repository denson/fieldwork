# Reviewer and live-test instructions

## Access requirements

Use desktop Chrome 140 or later with split view enabled. The extension adds controls to https://box.boodle.ai and the supported public activity sites. It does not implement its own login. A BoodleBox account with access to the guides is required to test the chat features. No local server, API key or command-line step is required.

Before submitting for review, make sure the reviewer can obtain the required BoodleBox access. If that requires a test login, provide a dedicated account and any necessary instructions in the dashboard's private test-instructions field. No credentials are included here, and no claim is made that anonymous BoodleBox access works. Never place personal passwords or test credentials in a public GitHub file, screenshot or store description.

## Business-plan handoff

First verify **Open workspace** from a new chat: after loading the extension, open the Business Plan profile and choose Start New Chat. Without refreshing the new chat, click Open workspace. With Chrome's blank split-view chooser beside the chat, the workspace should open there and the status should become Workspace connected. Without a blank paired pane, it should open a new tab while preserving other pages. This covers the new-chat routing fix in 0.10.2.

1. Open https://box.boodle.ai/a/@BusinessPlanFirstSteps and choose Start New Chat after signing in. Leave the new message box empty.
2. Open https://denson.github.io/fieldwork/?demo=business&example=yard&step=idea in a second tab. It loads a fictional yard-care plan. Put the chat and this workspace in the two halves of the same Chrome split view. Do not pair the example-selection catalog instead of the workspace.
3. Enable the companion in its toolbar popup. If pages predate installation/update, refresh both. The Business Plan chat should show **Workspace connected** above its message box.
4. Choose **Use the connected workspace**. A visible connection report and mode choice should be prepared in the message box. No message should be sent. Review it, then press Send.
5. On the website, open **Discuss this step with the BoodleBox guide** and review the fictional note. Choose **Put note in BoodleBox**. The exact paired chat should receive the note, with a connection report if the pair still responds. Review it and press Send.
6. Ask the guide: “Keep the yard-care idea. Rename it Cedar Yard Care and prepare the idea step for the connected workspace.” The guide should produce a readable draft card. Choose **Use this draft** and confirm the displayed name and idea appear in that website step. The website remains editable.
7. On the website, change the proposed name manually. The chat should not silently receive or claim to know that edit. A later reviewed note is needed to share it.
8. Choose **Keep planning in chat**, review and send that prepared choice. Ask “Show my brief.” The guide should retain the latest shared work and provide a readable chat brief without requiring the website.

## Important safeguards to exercise

- Type “Unsent test message” in the chat without sending. Try Put note in BoodleBox. The existing draft must remain unchanged. Clear it yourself after checking. Repeat with an attachment-only draft if your test account supports it.
- Disable the companion in its popup. Automatic connection and transfers should stop; ordinary chat and manual copying remain usable.
- Unpair the tabs or pair the chat with an unrelated website. No draft may be applied to a different page. Open workspace should preserve an occupied unrelated page and open a new workspace tab instead.
- Keep a blank Chrome split-view chooser beside the chat. Open workspace may use that blank pane after checking it again.
- Request only an explanation or a chat brief. No transfer or automatic Send should occur.

## Other supported activity navigation

Open https://denson.github.io/fieldwork/start.html with https://box.boodle.ai/a/@FieldworkFirstSteps as the matching guide. Prepared notes use the same reviewed placement. A deliberate Start activity with guide action may open the next matching guide and select its visible Start New Chat button; the previous chat stays in BoodleBox history. Test at least one such transition and the paired https://denson.github.io/colorado-weed-field-guide/ with https://box.boodle.ai/a/@ColoradoWeedGuide if all activities are enabled for the reviewer account.

## Review notes

The package is readable Manifest V3 code with no remote-code execution or extension backend. Browser metadata is used only for exact pane targeting and navigation. Notes and planning fields are not stored in extension storage. The store build deliberately removes localhost access and routing. The current extension requires the matching guide's normal English composer labels.

All 55 repository tests pass, including the new-chat routing regression against source and packaged background code. Automated verification also covers the store manifest/icons/runtime, public routes, transfer boundaries, races, existing drafts, note validation and unchanged business planning behavior. A live 0.10.2 candidate test is still required before review submission. The prepared store screenshot shows the unchanged website-side note control, captured with the earlier 0.9.0 extension; it does not assert that the 0.10.2 candidate has been loaded.
