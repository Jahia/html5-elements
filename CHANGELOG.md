# Changelog

All notable changes to the HTML5 Elements module are documented in this file.

## [Unreleased]

### Security
- `element.jsp` now escapes the user-supplied `elementStyle` value (`fn:escapeXml`) before rendering it into the `style="…"` attribute. It was the only custom attribute not escaped, allowing attribute-breakout HTML injection from the element's *Style* field. The `class`, `role`, and `aria-label` values were already escaped, and `elementId` / `data-*` names are constrained to `[a-zA-Z0-9-_]+` by the node-type definition.
