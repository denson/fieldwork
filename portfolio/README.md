# Fieldwork — public learning portfolio

[Start the tutorial](https://denson.github.io/fieldwork/) · [Choose an activity](https://denson.github.io/fieldwork/?demo=home)

The site includes First Steps, Pueblo History Detective, Before the wave arrives, Community Budget Challenge and Public Hearing Detective. Each has a published BoodleBox companion. Dot Lab is an older experiment excluded from the menu.

Plain HTML, CSS and JavaScript, hosted on GitHub Pages. No application server, private key or database is needed. Visitors can explore the activities without a BoodleBox account; chat requires BoodleBox sign-in. The optional earthquake explorer requests a public USGS feed directly from the visitor's browser.

The website provides evidence, interactive controls and calculations. The guide discusses the note the learner chooses to share. With Companion Pane 0.6.0 in Chrome split view, Put note in BoodleBox fills the matching empty draft; the learner reviews and presses Send. Clicked activity links can open the matching website and guide. Copy/paste is available without the extension. Other conversations and unshared clicks do not transfer.

Sources and image credits: [sources.html](sources.html). Library of Congress photographs and credited NOAA/USGS diagrams remain unchanged. Generated illustrations are labeled and have provenance files in assets. Budget and hearing scenarios are fictional teaching exercises; the earthquake lesson is not a warning service. Public lesson files are references, not live learner records.

Run the repository checks with `node --test portfolio/tests/*.test.cjs` from its root. GitHub Actions checks these before publishing this directory. See [publishing instructions](https://github.com/denson/fieldwork/blob/main/PUBLISHING.md) and [extension setup](https://github.com/denson/fieldwork/tree/main/chrome-extension).
