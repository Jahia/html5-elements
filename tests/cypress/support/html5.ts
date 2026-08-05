import {addNode as jahiaAddNode, deleteNode as jahiaDeleteNode, getNodeByPath, uploadFile} from '@jahia/cypress';

/**
 * Shared fixtures/helpers for the html5-elements specs.
 *
 * The module under test is a pure view module: it has no Java, no services and no GraphQL of its own.
 * Everything worth asserting is the *rendered markup*, so these helpers do three things only:
 *   1. create JCR content (elements, videos, files) through @jahia/cypress' JCR helpers,
 *   2. render a single node and hand back the response,
 *   3. clean up.
 *
 * Nodes are rendered individually via the .ajax fragment renderer (see renderNode) rather than by
 * building a page: that emits the node's own view and nothing else, which keeps the markup assertions
 * tight and avoids depending on a template set's own output.
 *
 * Content creation goes through the harness helpers rather than hand-written GraphQL so the query
 * shapes stay correct across @jahia/cypress upgrades - in particular uploadFile, which has to set
 * jcr:data with an explicit BINARY type.
 */

export const SITE_KEY = 'digitall';
export const CONTENTS_ROOT = `/sites/${SITE_KEY}/contents`;
export const FILES_ROOT = `/sites/${SITE_KEY}/files`;
export const TEST_FOLDER = 'html5ElementsTests';
export const CONTENT_PATH = `${CONTENTS_ROOT}/${TEST_FOLDER}`;
export const FILES_PATH = `${FILES_ROOT}/${TEST_FOLDER}`;

/** Stand-in payload for uploaded files. Nothing ever decodes it; only the JCR metadata matters. */
export const FILE_FIXTURE = 'sample-media.bin';

/** The 12 element types that all share the single html5mix:element view. */
export const ELEMENT_TYPES = [
    'article',
    'address',
    'aside',
    'div',
    'figcaption',
    'figure',
    'footer',
    'header',
    'hgroup',
    'main',
    'nav',
    'section'
];

/**
 * A breakout payload: it tries to close the enclosing attribute and open a new tag.
 * fn:escapeXml turns `"` into `&#034;` and `<` into `&lt;`, so a correctly escaped sink renders the
 * payload as inert text. Note that the *words* "onerror=alert(1)" survive escaping untouched - only
 * the quote and the angle brackets are neutralised - so assertions must look at the structure
 * (`<img` vs `&lt;img`), never at the absence of the words.
 */
export const BREAKOUT_PAYLOAD = '"><img src=x onerror=alert(1)>';

export interface JcrProperty {
    name: string
    value?: string
    values?: string[]
    type?: string
    language?: string
}

export interface CreatedNode {
    uuid: string
    path: string
}

interface AddNodeResult {
    data?: { jcr?: { addNode?: { uuid?: string } } }
    errors?: Array<{ message?: string }>
}

/**
 * Pulls the uuid out of an addNode/uploadFile result, failing with the server's own message.
 * Without this, a GraphQL-level rejection surfaces as "Cannot read properties of undefined", which
 * says nothing about the cause.
 */
const requireUuid = (result: AddNodeResult, label: string): string => {
    if (result?.errors?.length) {
        throw new Error(`${label} failed: ${JSON.stringify(result.errors)}`);
    }

    const uuid = result?.data?.jcr?.addNode?.uuid;
    if (!uuid) {
        throw new Error(`${label} returned no uuid: ${JSON.stringify(result)}`);
    }

    return uuid;
};

/**
 * Creates a node and yields its uuid and path.
 *
 * The path is composed from parent + name rather than read back from the mutation: JCRNodeMutation
 * exposes the created node under `node`, and we already know where we put it.
 */
export const addNode = (variables: {
    parentPathOrId: string
    name: string
    primaryNodeType: string
    mixins?: string[]
    properties?: JcrProperty[]
}): Cypress.Chainable<CreatedNode> =>
    jahiaAddNode(variables, {errorPolicy: 'all'}).then((result: AddNodeResult) => ({
        uuid: requireUuid(result, `addNode(${variables.primaryNodeType} ${variables.name})`),
        path: `${variables.parentPathOrId}/${variables.name}`
    }));

/**
 * Attempts to create a node but tolerates a GraphQL error, yielding the raw Apollo result.
 * Used to assert that a CND value constraint rejects a payload at write time.
 */
export const addNodeAllowingErrors = (variables: {
    parentPathOrId: string
    name: string
    primaryNodeType: string
    mixins?: string[]
    properties?: JcrProperty[]
}): Cypress.Chainable<{ errors?: unknown[] }> => jahiaAddNode(variables, {errorPolicy: 'all'});

/**
 * Uploads a jnt:file with an explicit jcr:mimeType.
 *
 * The mime type is caller-controlled here precisely because Jahia does not constrain it server-side,
 * which is what makes it untrusted input for video.jsp.
 */
export const addFile = (variables: {
    parentPathOrId: string
    name: string
    mimeType: string
    fixture?: string
}): Cypress.Chainable<CreatedNode> =>
    uploadFile(variables.fixture ?? FILE_FIXTURE, variables.parentPathOrId, variables.name, variables.mimeType).then(
        (result: AddNodeResult) => ({
            uuid: requireUuid(result, `uploadFile(${variables.name})`),
            path: `${variables.parentPathOrId}/${variables.name}`
        })
    );

export const deleteNode = (pathOrId: string): Cypress.Chainable =>
    jahiaDeleteNode(pathOrId, 'EDIT', {errorPolicy: 'all'});

/** Removes a node if it is there, so a re-run starts from a clean state. */
export const deleteNodeIfExists = (path: string): Cypress.Chainable =>
    getNodeByPath(path, [], 'en', [], 'EDIT', {errorPolicy: 'all'}).then(
        (result: { data?: { jcr?: { nodeByPath?: { uuid?: string } | null } } }) => {
            if (result?.data?.jcr?.nodeByPath?.uuid) {
                return deleteNode(path);
            }

            return cy.wrap(null);
        }
    );

/**
 * Renders one node on its own and yields the HTTP response.
 *
 * Note the `.html.ajax` suffix. Jahia's render servlet only serves a *page* at `<path>.html`; a bare
 * content node returns 404 there (an existing Digitall node such as home/landing behaves the same, so
 * this is platform behaviour, not something about these fixtures). The `.ajax` fragment renderer is
 * what serves a single non-page node, and it emits just that node's view - e.g. `<section></section>` -
 * with none of the surrounding page chrome. That is exactly what makes the markup assertions tight:
 * asserting against a full Digitall page would drown them in template output (and its own <img> tags,
 * which would break the escaping assertions outright).
 *
 * failOnStatusCode is deliberately true: a view that throws (e.g. resolving a dangling weakreference)
 * surfaces as a 500 here, so "the request succeeded" is itself one of the assertions.
 */
export const renderNode = (
    nodePath: string,
    options: { workspace?: string; language?: string } = {}
): Cypress.Chainable<Cypress.Response<string>> => {
    const {workspace = 'default', language = 'en'} = options;
    return cy.request({
        url: `/cms/render/${workspace}/${language}${nodePath}.html.ajax`,
        failOnStatusCode: true
    });
};

/**
 * Extracts the first start tag for `tag` from a response body, e.g. '<video autoplay controls>'.
 *
 * Assertions about which attributes are present belong on the start tag, not on the whole body:
 * scanning the body for a bare token like 'loop' or 'id=' picks up anything else the render happens to
 * emit and turns a passing fix into a flaky test.
 */
export const startTag = (body: string, tag: string): string => {
    const match = new RegExp(`<${tag}(\\s[^>]*)?>`).exec(body);
    expect(match, `expected a <${tag}> start tag in the response`).to.not.be.null;
    return match === null ? '' : match[0];
};

/** Asserts that a breakout payload was neutralised rather than reflected as live markup. */
export const expectPayloadEscaped = (body: string): void => {
    expect(body, 'raw <img> from the payload must not reach the output').to.not.contain('<img');
    expect(body, 'the payload must appear in its escaped form').to.contain('&lt;img');
};
