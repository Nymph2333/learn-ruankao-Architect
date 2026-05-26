# Phase 2.9 Interactive Content Harvesting Check

## Background

The authenticated crawler now reaches:

```text
https://ruankaodaren.com/exam/#/knowlegde
```

The latest inspected snapshot shows a real knowledge-directory page, but it does not confirm a concrete knowledge-point detail page or article body. The captured XHR responses also wrap useful data in string fields with `encrypt = 1`, so the crawler must gather more raw browser-rendered evidence before any parser work begins.

## Stage Goal

Phase 2.9 uses normal browser interaction to trigger front-end rendering:

- expand a visible directory or chapter row
- click the first conservative visible knowledge-node candidate
- wait for SPA rendering and network idle
- save the post-interaction raw snapshot

The crawler continues to save:

- rendered HTML
- full-page screenshot
- XHR / Fetch response wrappers
- metadata
- DOM visible text snapshot

## Prohibited Actions

The crawler must not:

- bypass login
- crack or infer private interfaces
- reverse or decrypt `encrypt = 1` payloads
- forge API requests
- parse knowledge-point body content
- render Markdown
- generate `docs/` knowledge documents
- enter Phase 3 implementation

Only normal visible-page clicking is allowed.

## DOM Text Snapshot

Phase 2.9 adds:

```text
sources/ruankaodaren/raw/dom-text/<timestamp>.txt
```

This file stores:

```ts
await page.locator("body").innerText()
```

The DOM text snapshot is useful because the front end may render useful text after client-side decoding or state updates even when XHR payloads are not directly parseable. It is still raw snapshot data, not parsed knowledge content.

## Metadata Fields

Phase 2.9 adds these metadata fields:

| Field | Meaning |
| --- | --- |
| `interaction_harvesting_attempted` | Whether the post-route interaction harvesting step ran |
| `directory_expand_attempted` | Whether the crawler attempted to expand a directory/chapter row |
| `directory_expand_success` | Whether a visible directory/chapter click appeared to expand content |
| `directory_expand_text` | The visible text clicked for directory expansion, or `null` |
| `knowledge_node_click_attempted` | Whether the crawler attempted to click a visible knowledge-node candidate |
| `knowledge_node_click_success` | Whether the node click appeared to change/render content |
| `knowledge_node_click_text` | The visible text clicked for the node candidate, or `null` |
| `post_interaction_url` | URL after the interaction sequence |
| `body_text_length` | Final visible body text length after interaction |
| `dom_text_path` | Path to the raw DOM text snapshot |
| `detail_content_signal` | Conservative diagnostic signal from body text or captured XHR bodies |

These fields are diagnostic only. They do not mean that Phase 3 parsing is allowed.

## Success Criteria

At least the following should hold after a successful Phase 2.9 run:

- `final_url` is `#/knowlegde` or a knowledge-base internal route
- `auth_state_used = true`
- `interaction_harvesting_attempted = true`
- `body_text_length` is meaningfully greater than the pre-interaction text length
- `knowledge_node_click_success = true` or `detail_content_signal = true`
- `dom_text_path` exists
- screenshot shows a detail/content area or a concrete knowledge-point page

## Failure Handling

If interaction harvesting does not reach detail content:

- keep the raw snapshot
- keep metadata diagnostics
- inspect the screenshot and DOM text snapshot
- refine only the Phase 2 click strategy
- do not add a parser
- do not forge API calls
- do not decode encrypted payloads by guesswork

Phase 3 remains blocked until a raw snapshot shows either visible detail content or stable, directly inspectable content-bearing data.
