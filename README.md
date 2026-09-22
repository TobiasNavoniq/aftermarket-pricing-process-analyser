# Aftermarket Pricing Process Analyser

Internal ThinkTrooper tool for reading an OEM's aftermarket pricing RFP and
mapping it onto the 9-step aftermarket pricing canvas.

## Layout

```
src/                 editable sources
  index.html         markup only
  css/               tokens, shell, welcome, sidebar, step, summary
                     report  <- the printed report template
                     print   <- paged-media rules
  js/                data, state, view-sidebar, view-step, view-summary, app
                     report  <- builds the printed report
  data/              canvas-colors.json, steps.json  <- the content lives here
                     report.json                     <- the report's fixed copy
  assets/logo.png
tools/build.py       bundles src/ into one standalone HTML
legacy/              the previous single-file version, kept for reference

AftermarketPricingProcessAnalyser_V0.2.0.html   <- the built tool; just open it
```

## The report

"Print / Save PDF" on the coverage summary builds a landscape A4 document and
opens the print dialog; choose "Save as PDF" as the destination. It is 12 pages
for the shipped library: a cover, an executive summary with numbered exhibits,
one chapter per canvas step, and a closing page.

Every figure in it is a count of requirements taken from the live session --
nothing is modelled. Coverage is `in scope / applicable`, with anything marked
not applicable removed from both sides.

Two things to know when editing it:

* The fixed prose (cover panels, glossary, closing page) is in
  `src/data/report.json`, not in the code.
* Chrome's print dialog has **Background graphics** off by default. The report
  forces `print-color-adjust: exact`, so the dark cover and the coverage bars
  come out either way.

**All requirement content is in `src/data/steps.json`.** Adding a step or a
requirement means editing that file only — no code changes.

## Working on it

Serve the split sources (the JSON is loaded with `fetch`, so `file://` will not
work for development):

```
python -m http.server 8000 --directory src
```

then open http://localhost:8000/

## Building the standalone file

```
python tools/build.py
```

This inlines every stylesheet, script, JSON file and the logo into
`AftermarketPricingProcessAnalyser_V0.2.0.html` in the repo root — a single file
that runs by double-clicking it, offline, with no server and no sibling files.
In that build the JSON arrives as `window.RFP_BUNDLED_DATA`, which
`src/js/data.js` prefers over `fetch`.

Rebuild after every source change. The root HTML file is generated — edit
`src/`, never the built file.
