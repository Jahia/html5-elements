# Changelog

All notable changes to the HTML5 Elements module are documented in this file.

## [Unreleased]

### Security
- `element.jsp` now escapes the user-supplied `elementStyle` value (`fn:escapeXml`) before rendering it
  into the `style="…"` attribute. It was the only custom attribute not escaped at the time, allowing
  attribute-breakout HTML injection from the element's *Style* field. (PR #1)
- `video.jsp` now escapes `fallbackContent` before rendering it inside `<video>`. It was written out
  verbatim, so an editor could store markup (e.g. `<img src=x onerror=…>`) that executed in a visitor's
  browser. (PR #3)
- `element.jsp` now escapes `elementId` before rendering it into the `id="…"` attribute. It was the last
  custom attribute relying solely on the `[a-zA-Z0-9-_]+` value constraint from `definitions.cnd`, which
  left the component's safety dependent on that constraint holding on every JCR write path rather than on
  the sink.
- `element.jsp` no longer composes `data-*` attributes into pre-built markup strings that had to be
  written out unescaped. Names and values are now emitted separately in the start tag, and the attribute
  name is escaped as well as constrained.
- `video.jsp` now escapes the `jcr:mimeType` value rendered into `<source type="…">`. The picker's
  `mime='video/*'` restriction is a UI filter, not server-side validation, so the mime type of the
  referenced file is not a trusted value.
- `SECURITY.md` documents the module's trust model and the residual risks that escaping does not
  address — arbitrary inline CSS via the *Style* field, and its consequence for Content Security Policy.

### Fixed
- The localized `<video>` fallback text is no longer silently dropped. `video.jsp` resolved the default
  from the resource bundle and then immediately overwrote it with the (empty) node property, so any video
  without the `html5mix:videoAdvancedSettings` mixin rendered no fallback content at all.
- A deleted video `source` or `poster` file no longer breaks page rendering. Both are weakreferences and
  therefore carry no referential integrity: `mandatory` guards the save, not the read, and resolving a
  dangling reference throws `ItemNotFoundException`. The references are now resolved defensively — live
  mode renders nothing, and edit mode shows the editor which component needs fixing.
- `<video><source>` now carries the real content type. `video.jsp` read `jcr:mimeType` from the `jnt:file`
  node, but that property lives on the file's `jcr:content` child (`jnt:resource`), so the attribute always
  rendered as `type=""`. It is now read via `getFileContent().getContentType()`. This also made the
  escaping of that value meaningful — previously the value could never reach the sink at all.

### Added
- End-to-end test harness under `tests/` (`@jahia/cypress`, Docker-based), covering the rendered markup of
  every `html5nt:*` element, the custom/data attribute mixins, the escaping fixes above, and the `<video>`
  fallback, mime type and dangling-reference behaviour. 32 tests, all passing against Jahia 8 with the
  Digitall fixture site.
