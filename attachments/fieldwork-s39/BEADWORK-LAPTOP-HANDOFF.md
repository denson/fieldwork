# Laptop handoff: lymphedema research guide
Prepared October 17, 2026, America/Denver.
Beadwork task: **fieldwork-s39**, open for the laptop agent, in `denson/fieldwork` on its `beadwork` branch. Related completed delivery: `fieldwork-m89`.

## Mission
Take over the existing project on Denson's laptop. Edit the prepared presentation script when requested, present it while controlling the real website in desktop Chrome, answer interruptions without losing the place, and maintain the website or Boodlebot when Denson requests changes. This is a ready-to-claim handoff, not a claim that the laptop has already been configured.

## Get the material
- Private source repository: https://github.com/denson/lymphedema-research (branch main).
- Live website: https://acebilustat-lymphedema-research.denson.chatgpt.site/
- Published script reader: https://acebilustat-lymphedema-research.denson.chatgpt.site/presenter
- Boodlebot: https://box.boodle.ai/a/@LymphedemaResearchGuide (free BoodleBox account required).
- Existing delivery record: fieldwork-m89 in https://github.com/denson/fieldwork, branch beadwork.
- Latest published website source: 84e8f4ecfd3cdc27cdc4f7f18a477da907bf8b64. Later documentation commits may follow; use current main.

Clone the lymphedema repository to C:\Users\denso\codex_projects\lymphedema_research or the laptop user's chosen equivalent outside OneDrive. Inspect an existing checkout before pulling; preserve local changes. Never write under OneDrive without specific authorization.

Read AGENTS.md, LAPTOP-HANDOFF.md, presentation-sections.json, presentation-plan.json, presentation-script.txt, and presentation-session-notes.txt. start-presentation.txt is the pasteable startup request.

## What to edit
- presentation-plan.json: canonical 31 speaking beats, narration and delivery rules.
- presentation-sections.json: 12 default sections plus 10 optional branches, beat groupings, narration overrides and direct URLs. Use the route rather than speaking every beat in numeric order.
- presentation-script.txt and narration-introduction.txt: readable script copies.
- dist/presentation-plan.json, dist/presentation-script.txt, dist/narration-introduction.txt and dist/presenter.html: published script copies/reader. Keep these consistent with canonical narration when editing.
- dist/index.html and presentation-navigation assets: real website source and controls.
- dist/references.json: 14 original research references.
- dist/treatment-icons.json and dist/icons/: six treatment/reference icon associations. Shared references retain every associated icon.
- dist/section-images.json, dist/images/sections/, section-image-prompts.json: eight section illustrations and provenance.
- boodlebot/: editable prompt, four knowledge files, manifest and retained tests. Updating website files does not automatically update the published bot.

Use the installed Sites skill for requested website publication. Preserve .openai/hosting.json and Site ID appgprj_6ad2c698b9a48191a411fa4f3e6b277d. Open/reconcile the existing Site source, publish to the same Site with its existing owner-private audience, then synchronize the private GitHub repository. GitHub push alone does not redeploy the Site. Do not create a replacement Site or a localhost preview. No publication is needed just to present.

## Presenting and navigation
Introduce yourself as the AI guide for a site about emerging lymphatic care. Denson supervises the research. Near the start, describe the Boodlebot as a low-cost AI-assisted way to explore the information from a phone or laptop, requiring a free BoodleBox account.

Deliver ONE short conversational section, then STOP. Wait for next, move on, a question or a chosen topic. Do not append invitations for feedback, questions, comments or permission to continue. No long artificial pauses, no unsolicited restart, and no save/commit/push/publish between spoken sections. Keep the script and place in memory; batch saving when requested or after the presentation.

The previous tour reached its closing. Wait for Denson to request a new tour or name a section. Answer interruptions and retain the place. All alternative treatments are optional branches; do not force the ointment as the only choice.

Use the laptop's desktop Chrome and its actual supported browser connection. Reuse the correct tab and check setup once. Do not substitute the in-app browser. The phone voice session must reach the same agent controlling the laptop; repository access does not transfer a live voice session.

Use stable direct URLs from presentation-sections.json, such as:
- ?section=welcome
- ?section=landscape
- ?section=leg-study
- ?section=arm-study
- ?section=studies-together
- ?section=trial-preparation
- ?section=timeline
- ?section=sources
- ?section=closing

If the browser exposes WebMCP, use show_presentation_section with the known section id. Otherwise navigate directly once to the live URL and verify #presentation-status or #presentation-state. The original desktop verified direct navigation and all eight illustrations; WebMCP was unavailable in that connection. Do not hunt for headings or scroll by guessed pixel distances.

## Evidence and limits
The research snapshot is October 16, 2026. The leg study enrolled 30 people; 23 completed a year, with usual care and no placebo. Its observations are encouraging, not proof that all improvement came from acebilustat. The arm study added a placebo comparison; its results were unavailable in this snapshot. Do not describe two confirmed positive studies. Phase 3 is conditional, recruitment is unconfirmed here, and 2029-2032 is an illustrative approval window, not a sponsor timetable. Approaches have not been directly compared to establish a best treatment.

The existing separate weekly monitor is recorded as Mondays at 9 a.m. Mountain Time, covering all listed approaches and credible new lines of research. Do not create a duplicate or claim this laptop agent verified a run or controls the monitor merely from these files.

At the close, offer to prepare a DETAILED doctor discussion brief in this chat, with findings, uncertainties, original sources and questions. Denson authorized reviewed email delivery through his Gmail connector. Verify the laptop's actual connected account, recipient and approved content before sending. No individual brief, recipient or email is pending. Do not store private medical or email data in Git or Beadwork. The Boodlebot has no Gmail control.

## Laptop acceptance
1. Repository files loaded and current main inspected without overwriting local work.
2. Real Site accessible in the intended desktop Chrome profile.
3. Requested section navigation visibly verified once; voice reaches the same agent if used.
4. Agent reports ready briefly, then waits for Denson's requested section or edit.
5. For edits, synchronize narration formats, check anchors/source links, publish requested website changes through Sites, and push the portable source.
6. Close this laptop takeover task only after actual laptop readiness/work is verified; posting the handoff alone does not fulfill it.

## Startup request
Read AGENTS.md and BEADWORK-LAPTOP-HANDOFF.md in https://github.com/denson/lymphedema-research. Take over this project on my laptop. Load the prepared script and section map, verify control of the real Site in desktop Chrome, and tell me briefly when ready. Edit the script when I ask. Present one conversational section at a time and stop without asking for feedback. Retain our place through interruptions. Do not use localhost, create a new Site or duplicate the monitor.
