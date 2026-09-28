# Companion pairing inventory

The pairing source is [companion-registry.json](companion-registry.json), published with the Fieldwork website. Future lesson paths and BoodleBox guide names belong there, not in the Chrome extension. The extension still limits its access to approved website origins and requires a human click for each transfer.

| BoodleBox guide | Workspace | Content to maintain when this pair changes |
| --- | --- | --- |
| [Business Plan First Steps](https://box.boodle.ai/a/@BusinessPlanFirstSteps) | [Business plan workspace](https://denson.github.io/fieldwork/?demo=business&step=idea) | Bot greeting and knowledge; business-plan landing page; portfolio listing. The plan-specific draft/revision protocol remains a separate extension feature. |
| [Colorado Plants & Practical Care](https://box.boodle.ai/a/@ColoradoWeedGuide) | [Colorado Plants site](https://denson.github.io/colorado-weed-field-guide/) | Bot greeting and knowledge; guide links on the separate Plants website; pairing registry. |
| [Fieldwork Portfolio Guide](https://box.boodle.ai/a/@FieldworkPortfolioGuide) | [Portfolio](https://denson.github.io/fieldwork/?demo=home) | Bot's list of activities; portfolio cards and links; pairing registry. |
| [Fieldwork First Steps](https://box.boodle.ai/a/@FieldworkFirstSteps) | [First Steps](https://denson.github.io/fieldwork/start.html) | Bot greeting and topic links; practice page; pairing registry. |
| [Pueblo History Detective](https://box.boodle.ai/a/@PuebloHistoryDetective) | [History workspace](https://denson.github.io/fieldwork/?demo=history) | Bot knowledge and return links; portfolio card; pairing registry. |
| [Earthquake & Tsunami Guide](https://box.boodle.ai/a/@EarthquakeTsunamiGuide) | [Dedicated tsunami investigation](https://denson.github.io/fieldwork/tsunami.html?case=alaska1964&step=reach) | The guide's published greeting and knowledge were updated to the dedicated page. Check the published Portfolio Guide and First Steps topic links for any older combined-page URL; retain the old route only as a compatibility link. |
| [Community Budget Coach](https://box.boodle.ai/a/@CommunityBudgetCoach) | [Budget workspace](https://denson.github.io/fieldwork/?demo=budget) | Bot knowledge and return links; portfolio card; pairing registry. |
| [Eastbank Hearing Guide](https://box.boodle.ai/a/@EastbankHearingGuide) | [Hearing workspace](https://denson.github.io/fieldwork/?demo=hearing) | Bot knowledge and return links; portfolio card; pairing registry. |
| [A2A Commerce Lab Guide](https://box.boodle.ai/a/@A2ACommerceLabGuide) | [A2A lab](https://denson.github.io/fieldwork/a2a.html) | Bot knowledge and lab links; pairing registry. The separate chat-only A2A tutor does not need an extension pairing. |
| [Device Support with Workspace](https://box.boodle.ai/a/@DeviceSupportWorkspace) | [Device support workspace](https://denson.github.io/fieldwork/device-support.html) | Retired failed experiment. Keep its route only for existing test links; do not promote it as a production pair. |

For this registry migration, reload and retest every active pair with extension 0.10.12 once. After that, adding a new page under the approved Fieldwork or Plants website changes the published registry, bot knowledge, and website links only. A new domain, new transfer behavior, or changed browser permissions still requires an extension release.

The chat-only BoodleBox portfolio has no workspace pairing, so its bot list does not need a registry entry. Workspace-only pages likewise need no BoodleBox entry until intentionally paired.
