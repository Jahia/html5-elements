# Tests

## What this suite covers

`html5-elements` is a pure view module: no Java, no services, no GraphQL of its own. The only thing worth
asserting is therefore the **rendered markup**, so every spec follows the same shape — create JCR content
through the standard Jahia GraphQL JCR API, render the node, assert on the HTML.

Nodes are rendered one at a time via `/cms/render/default/en<path>.html` rather than by assembling a page.
That renders the node with its default view and nothing else, which keeps assertions tight and avoids
coupling them to a template set's own output. Shared helpers live in `cypress/support/html5.ts`.

| Spec | Covers |
|------|--------|
| `01-elements.cy.ts` | The single `element.jsp` view maps each of the 12 `html5nt:*` types to the right tag; `html5mix:elementCustom` and the three `elementData*` mixins render their attributes; a bare element renders no attributes. |
| `02-escaping.cy.ts` | Attribute-injection regressions. Values (`elementStyle`, `elementCssClass`, `elementRole`, `elementAria`, `dataValue`) must render escaped; attribute **names** (`elementId`, `dataName`) must be rejected at write time by the `[a-zA-Z0-9-_]+` constraint in `definitions.cnd`. |
| `03-video.cy.ts` | `<video>`/`<source>` rendering, the localized fallback text, escaping of `fallbackContent` and of the untrusted `jcr:mimeType`, and graceful degradation when a `source`/`poster` weakreference is left dangling. |

Two assertion conventions matter when adding specs:

- **Assert on the start tag, not the whole body.** Use the `startTag(body, 'video')` helper. Scanning the
  full response for a bare token like `loop` or `id=` picks up anything else the render emits.
- **Assert on structure, not on the payload's words.** `fn:escapeXml` only neutralises `& < > " '`, so the
  literal text `onerror=alert(1)` survives escaping. Check that `<img` is absent and `&lt;img` is present
  (that is what `expectPayloadEscaped` does), never that the words are gone.

The fixture site is `digitall`, installed by `assets/provisioning.yml`. The module is enabled on it from
each spec's `before()` hook (`enableModule`) rather than from the provisioning manifest, because the
manifest can run before the module artifact has been installed.

## Running the tests

Two options are available to run the tests, you can either run everything in Docker or only run Jahia in Docker and run the tests using your local node.

### Run all in Docker

Once you have a built test container, the entirety of the tests, from environment provisioning to report generation, can be executed using a single command.

```bash
# Build the test container
> bash ci.build.sh
# Execute the tests
> bash ci.startup.sh
```

This is this exact process that will be used by the CI platform to execute the tests. And although it's definitely the easiest way of going through one run, it's also the method you're the less likely to use on a day-to-day (that would have been too easy, isn't it ?). 

The primary reason for this method to be "somewhat" reserved to the CI platform, is that it doesn't make it easy to develop new tests or debug one single test.

IMPORTANT: If you are using this method locally, do not forget that you will need to **rebuilt the test container** (`bash ci.build.sh`) for everytime a change is done in the `tests/` folder, otherwise your change will not make their way to the container.

### Run the tests on a local node

This is the method you will be using the most when developing or debug tests, and the major point of attention here concerns the use of the `env.run.sh` script.

As a reminder, the purpose of the `env.run.sh` script is to provision the environment **AND** execute the tests, in most cases you'd want to provision the environment only once, but run the tests multiple times.

```bash
# Fetch the necessary javascript dependencies
> yarn
# Run the docker environment, but without the tests
> ./ci.startup.sh notests
# Provision the environment and run the tests in headless once
> ./env.run.sh
# For bash
> ./set-env.sh
> yarn run e2e:debug
```

The advantage of this approach is that you'll get to run the tests in headless once, and although it delays a bit the time by which you can start developing, it also give you a good sense of whether your environment is setup properly.

Do *NOT* forget to load your environment variables using `source set-env.sh` prior to running Cypress, as well as **everytime you open a new terminal**.

In most situations you will end-up with a lot of unit tests, slightly less API e2e, and fewer UI e2e. Note that the purpose of these tests is to validate the proper behavior/operation of the module being developed. It would likely still be necessary to implement various high level integration tests to ensure your module operate well with other in different "real-life" deployment scenarios (but those tests are typically executed after merging of the code).