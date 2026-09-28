# Harbor Point uncertainty exercise — author test, 28 September 2026

The previous two-route arrival-time controls were understandable mathematically but did not answer a question that mattered to the learner. This revision asks about peak water level at one fictional harbor gauge and what remains uncertain as evidence improves. The example is separate from all historical cases and is never a forecast or all-clear.

## Teaching design

- The four presets move from an earthquake-only estimate to a direct offshore wave reading, more detailed harbor mapping, and a larger wave near high tide. The first three share a 2.5 m center but have successively narrower ranges; the fourth moves the center upward. This lets the learner see that more evidence can reduce uncertainty without necessarily lowering the hazard.
- Three grouped pairs of sliders change the working value and assumed spread for the offshore component, local harbor response, and tide contribution. Endpoints are arithmetic combinations of assumptions, **not** calibrated confidence intervals or Dempster–Shafer belief/plausibility numbers. The user's Dempster–Shafer repository informed the emphasis on separating what is supported from what remains unresolved; its methods were not copied into this toy model.
- The comparison line is a fictional 3 m teaching reference, explicitly not a safety threshold. The activity distinguishes a gauge level from beach runup and flood depth. NOAA explains why actual forecasts combine deep-ocean observations with site-specific models: https://nctr.pmel.noaa.gov/tsunami-forecast.html .

## Checks completed

- Automated journey, routing, and registry tests passed; browser state from the retired exercise retains other saved answers but resets its controls.
- Local browser: initial range 0.8–5.0 m; mapped-harbor preset 2.1–2.9 m; widening offshore spread changes it to 1.9–3.2 m. The comparison status changed with the range. Writing an explanation enabled the authored explanation, and the reviewed Markdown note included the actual edited values and assumption caveats. Reset restored the initial range and cleared the explanation.
- Narrow viewport: the three groups and background cards reduced to one column without page overflow. Desktop screenshot and accessibility tree showed labeled sliders, a textual range, and a described comparison line.

## Still to verify

After deployment, verify the public page has the new exercise and the published BoodleBox guide uses its v4 knowledge snapshot. Then test a new BoodleBox conversation and installed-extension note handoff. No independent recipient has evaluated this revision yet.
