# BoodleBox build skills

These are the shared, editable copies of the workflow skills developed for Fieldwork. They guide an agent's work; they do not grant BoodleBox account access or prove that a bot works. The matching skills under Denson's local Codex skills directory are installed copies. Make future changes here and synchronize those local copies when needed.

| Task | Skill |
| --- | --- |
| Build a bot that completes its task in chat | [Standalone bot](boodlebox-standalone-bot/SKILL.md) |
| Build a BoodleBox guide paired with a website | [Companion workspace](boodlebox-companion-workspace/SKILL.md) |
| Add a paired lesson under an approved Fieldwork origin without changing the extension | [Add companion content](boodlebox-add-companion-content/SKILL.md) |
| Convert between a chat-only and a paired experience | [Convert experience](boodlebox-convert-experience/SKILL.md) |

Read the relevant `SKILL.md` before a build. For an existing paired Fieldwork experience, read the companion and add-content skills together. Preserve the difference between a source draft, a published bot, an author-account test, a separate-recipient test, and production readiness. Record observed results in [the evaluation ledger](../portfolio/BOT-EVALUATIONS.md).

## First dot build exercise

Use the [standalone bot skill](boodlebox-standalone-bot/SKILL.md) to create a BoodleBox bot tentatively called **Talk It Through**. This is a test of the dot's ability to use the BoodleBox web builder, not a claim that the product is ready for Sam.

The intended visitor is someone using a phone who may dictate rough thoughts. The bot should begin with one friendly, open question, then help turn the visitor's own words into either a short message they can review or a short next-step note. It should ask one useful question at a time, accept corrections such as “shorter” and “start over,” avoid assumptions about the person's health or ability, and never claim it sent a message or performed an external action. Keep the entire task in chat; no website, extension or API is needed.

Build and test it in Denson's authorized BoodleBox account. If account access is missing, report that rather than pretending to build. Test a messy first answer, a request for a shorter version, an early request for the result, and a request to send the result. If publishing is needed for a fresh-chat test, publish it to the account but do not invite or share it with others yet. Return the bot profile or editor link, a test-chat link, the model shown, what passed, what failed, and what still requires a real iPhone test. The iPhone Voice Control → BoodleBox input → Send loop is unverified; do not call the bot voice accessible until it is tested with Sam.
