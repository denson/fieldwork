# Privacy practices — prepared answers

These answers describe the 0.10.2 **store build**, not the development checkout. Match them to the current dashboard labels and review the certifications yourself before submitting.

## Single purpose — paste

Connect a supported Fieldwork activity with its matching BoodleBox guide in Chrome split view, allowing the visitor to review and move notes, apply business-plan draft fields, and navigate the paired activity. Each operation belongs to this same page-to-guide handoff.

## storage justification — paste

chrome.storage.local stores the companion's enabled/disabled preference. chrome.storage.session holds temporary metadata for a visitor-requested transition to a matching guide: tab IDs, relevant URLs, destination companion, a one-use token, phase and a 60-second validity limit. Completed/canceled jobs are removed; abandoned session records cannot be used after expiry and disappear when the session ends. Notes, chat drafts and financial fields are not stored by the extension.

## tabs justification — paste

The extension must identify the exact two tabs sharing a Chrome splitViewId and windowId, check their current and pending URLs again before delivery, and open the activity the visitor selected. tabs permission is also needed to recognize Chrome's own blank split-view chooser URL: without it, the extension cannot safely distinguish that chooser from an unknown occupied page. It reads current tab metadata for pairing, not Chrome's stored browsing history, and never scrapes unrelated page content. activeTab alone cannot maintain the user-visible connection indicator or identify both paired pages and the blank chooser.

## Host permissions justification — paste

https://box.boodle.ai/* is required to identify the matching guide and composer, display handoff controls, read recognized draft blocks and supported links, and prepare visitor-approved notes in that composer. https://denson.github.io/* is required for the published Fieldwork and Colorado Weed Field Guide activities. Activity content-script matches are restricted to /fieldwork/* and /colorado-weed-field-guide/*, and routing checks restrict supported destinations; Chrome host permissions operate at origin scope. No other origins, localhost sites, cookies, network interception or all-sites access are requested by the store build.

## Remote code

Select **No, I am not using remote code**. All extension JavaScript is inside the upload ZIP. It does not fetch or execute scripts from the websites. A chat draft is parsed as bounded JSON data and validated against known step fields; it is never executed as code. BoodleBox's own website/model runs separately from the extension.

## Data categories

Do **not** select “does not collect or use user data.” Local-only handling still requires disclosure. Based on the current features, disclose these categories:

| Category | What the extension handles |
| --- | --- |
| Website content | Prepared activity notes, supported links, known draft code blocks and form values used in approved handoffs. |
| Web history / browsing activity | URLs and metadata of currently open tabs needed to identify and check the split-view pair. No stored-history API or history profile. |
| Personal communications | The current BoodleBox message draft and recognized planning drafts/notes. Composer text is inspected to preserve existing work. |
| Financial and payment information | Business-plan prices, costs, income assumptions and other financial figures in the fields a visitor chooses to transfer. No payment cards, banking login or billing integration. |
| Personally identifiable information | Names or contact details a visitor includes in free-text planning fields or notes handled by the extension. No separate identity collection. |

There is no device-location access, authentication credential collection, health-information feature, or separate activity analytics/keylogging. Do not claim those features exist. Voluntary free-text content is handled as described above; advise visitors not to put secrets in planning notes. If the product's scope changes, revisit its disclosures.

## Data-use certifications

The inspected extension code is consistent with: no sale or transfer unrelated to the stated function; no use unrelated to the stated function; and no use or transfer to determine creditworthiness or lending eligibility. The publisher must review and make the dashboard's certifications. These files do not accept any agreement or certify on the publisher's behalf.

Privacy URL: https://denson.github.io/fieldwork/extension-privacy.html

## Sources

Google's [privacy fields guide](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy) and [User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) explicitly include local handling. See also the [Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs) and [match patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).
