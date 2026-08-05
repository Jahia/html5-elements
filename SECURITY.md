# Security Policy

## Reporting a Vulnerability

Security information can be found in our [security.txt file](https://academy.jahia.com/.well-known/security.txt).

## Trust model

This module renders editor-supplied values into HTML attributes. It assumes an author with edit rights
on a component is **semi-trusted**: they may set arbitrary attribute values, but they must not be able
to inject markup or script that runs in a visitor's browser.

All values interpolated into an attribute are escaped with `fn:escapeXml` at the point of output
(`element.jsp`, `video.jsp`). Attribute *names* (`elementId`, `dataName`/`dataName2`/`dataName3`) are
additionally constrained to `[a-zA-Z0-9-_]+` by the value constraints in
`src/main/resources/META-INF/definitions.cnd`. Escaping alone is not sufficient for a name — it does not
remove whitespace, which is all an attacker needs to append a further attribute — so **the constraint and
the escaping are a pair**. Do not relax the constraint without adding a whitelist check at the sink.

## Known residual risks

### `elementStyle` allows arbitrary inline CSS

The *Style* field (`html5mix:elementCustom` / `elementStyle`) is escaped, so it cannot break out of the
`style="…"` attribute. Escaping does **not** constrain the CSS itself, and an author who can set it can
therefore still:

- build an invisible full-viewport overlay (`position:fixed;inset:0;z-index:9999;opacity:0`), i.e. a
  UI-redressing / click-hijacking surface, from a single component;
- trigger an outbound request on render (`background-image:url(https://…)`), which leaks visitor IPs and
  can be used as a beacon.

Both are inherent to offering a free-text `style` field and are bounded by *who you grant edit rights to*,
not by this module.

### Content Security Policy

Because the module writes inline `style` attributes, any site using the *Style* field requires
`style-src 'unsafe-inline'` in its CSP. That weakens one of the main defence-in-depth layers against XSS.

Operators who need a strict CSP have two options, both site-level decisions rather than module defaults:

1. Do not grant the *Customize* mixin (`html5mix:elementCustom`) to roles that should not set inline CSS,
   and drive presentation through `elementCssClass` plus site CSS instead.
2. Replace the free-text `elementCssClass` with a curated `choicelist` of site-approved classes and stop
   using `elementStyle` altogether.

### `role` and `aria-label` are unvalidated

`elementRole` accepts any string; an invalid role is silently ignored by user agents. This is an
accessibility correctness issue rather than a security one, but it means the rendered attributes should
not be relied on as a security or semantics boundary.
