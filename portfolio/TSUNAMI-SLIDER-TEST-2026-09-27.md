# Fictional tsunami-crossing activity: author test, 27 September 2026

This record concerns the first stop of the Earthquake & Tsunami Guide's Alaska example. It is an author-account test, not a separate recipient test or evidence of a real forecast.

## Task and observed site behavior

The learner is invited to make a simplified ocean crossing take about four hours by moving **distance** and **average depth** sliders. The site calculates speed from `sqrt(9.81 × depth) × 3.6` in km/h and divides distance by speed. At 2,500 km and 4,000 m, it displayed roughly 713 km/h and 3.5 hours. The reviewed note separated the learner's selected values and interpretation from the page-calculated result. Untouched default values did not count as an answer. The page explicitly identified the calculation as a fictional, constant-depth sketch, not an arrival forecast, warning time, or evacuation guidance. [NOAA describes the underlying deep-ocean speed relationship](https://www.ncei.noaa.gov/products/natural-hazards/tsunamis-earthquakes-volcanoes/tsunamis/travel-time-maps).

The local automated suite passed 72 checks, including this calculation and the exported note. The published GitHub Pages activity was opened after deployment and showed the new exercise. These checks do not establish that a new visitor can complete the entire bot-and-workspace flow.

## Bot response and correction

In the first signed-in Test Bot run, the guide interpreted the slider result as time available for warning and evacuation. That was a teaching error: wave crossing time does not establish detection, assessment, alert issuance, communication, or how much time residents have to act.

The guide's published instructions were tightened to forbid that inference. In a fresh Test Bot conversation with the same fictional values, it correctly described the depth effect and said: “crossing time is not the same as warning time — detection and alerts take extra time, and people must be able to act.” That retest is narrower evidence than an independent learner test; the response also moved quickly to a broader question about the warning chain.

## Still to test

- A separate person using the installed extension in split view can move the sliders, review the note, send it to the guide, and understand the guide's answer.
- The guide stays clear about the difference between a toy crossing calculation, actual arrival estimates, and actionable warnings when the learner changes the numbers or asks a follow-up.
- Manual copy and paste works when the extension is absent.

## Revised question, later on 27 September

The first version above was replaced after review: making a crossing take roughly four hours was too easy and the fictional setup was not explained soon enough. The page now explains the constant-depth model before the controls. A learner predicts whether a 4,000 km route through 4,000 m of water takes longer than a 2,000 km route through 1,000 m of water, then sets the second route with sliders. The model makes both crossings about 5.6 hours because quadrupling depth doubles speed, balancing the doubled distance. The answer and short explanation appear only after a prediction and slider adjustment. The prepared note includes the prediction, both route settings, calculated times, and the learner's own explanation. A completed note requires the specified comparison; partial settings are not reported as completion.

Local browser inspection showed the explanation, prediction, slider result, and prepared note. The published bot's instructions and attached lesson were updated to match, but the revised chat response and installed-extension handoff still need a fresh end-to-end test. This update does not change the earlier bot failure and retest described above.
