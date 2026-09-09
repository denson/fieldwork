# Fieldwork

Hands-on learning activities with companion BoodleBox guides, by Denson Smith.

[Start the tutorial](https://denson.github.io/fieldwork/) · [Explore the portfolio](https://denson.github.io/fieldwork/?demo=home)

Four activities: Pueblo History Detective, Before the wave arrives (earthquakes and tsunamis), Community Budget Challenge, and Public Hearing Detective. The First Steps tutorial introduces using the website alongside a BoodleBox guide. The older Dot Lab experiment is excluded from the current menu.

The website supplies images, evidence, controls and calculations. BoodleBox supplies the conversation. The optional Chrome extension places a chosen note in the matching chat draft; the learner reviews it and presses Send. Chat links can open the matching activity in Chrome's paired pane. Conversations stay in BoodleBox; unseen clicks and answers are not sent automatically.

`portfolio/` is a plain HTML/CSS/JavaScript site published with GitHub Pages. `chrome-extension/` contains the optional unpacked Companion Pane extension. No application server or API key is needed. The optional earthquake explorer reads a public USGS feed directly from the visitor's browser. Source credits and fictional-scenario labels are included in the activities.

See [publishing instructions](../PUBLISHING.md) and [extension instructions](../chrome-extension/README.md). Run `node --test portfolio/tests/*.test.cjs` to check the activities and extension routing.

This independent portfolio is not an official BoodleBox, Library of Congress, NOAA or USGS product.
