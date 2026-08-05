import gql from 'graphql-tag';

/**
 * Shared fixtures/helpers for the html5-elements specs.
 *
 * The module under test is a pure view module: it has no Java, no services and no GraphQL of its own.
 * Everything worth asserting is the *rendered markup*, so these helpers do three things only:
 *   1. create JCR content (elements, videos, files) through the standard Jahia GraphQL JCR API,
 *   2. render a single node and hand back the response,
 *   3. clean up.
 *
 * Nodes are rendered individually via /cms/render/<workspace>/<lang><path>.html rather than by building
 * a page: that renders the node with its default view and nothing else, which keeps the markup
 * assertions tight and avoids depending on a template set's own output.
 */

export const SITE_KEY = 'digitall';
export const CONTENTS_ROOT = `/sites/${SITE_KEY}/contents`;
export const FILES_ROOT = `/sites/${SITE_KEY}/files`;
export const TEST_FOLDER = 'html5ElementsTests';
export const CONTENT_PATH = `${CONTENTS_ROOT}/${TEST_FOLDER}`;
export const FILES_PATH = `${FILES_ROOT}/${TEST_FOLDER}`;

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
 * payload as inert text. Note that the *words* "onerror=alert(1)" survive escaping untouched — only
 * the quote and the angle brackets are neutralised — so assertions must look at the structure
 * (`<img` vs `&lt;img`), never at the absence of the words.
 */
export const BREAKOUT_PAYLOAD = '"><img src=x onerror=alert(1)>';

export interface JcrProperty {
    name: string;
    value?: string;
    values?: string[];
    type?: string;
    language?: string;
}

const ADD_NODE = gql`
    mutation addNode(
        $parentPathOrId: String!
        $name: String!
        $primaryNodeType: String!
        $mixins: [String]
        $properties: [InputJCRProperty]
    ) {
        jcr {
            addNode(
                parentPathOrId: $parentPathOrId
                name: $name
                primaryNodeType: $primaryNodeType
                mixins: $mixins
                properties: $properties
            ) {
                uuid
                path
            }
        }
    }
`;

const ADD_FILE = gql`
    mutation addFile($parentPathOrId: String!, $name: String!, $mimeType: String!, $data: String!) {
        jcr {
            addNode(
                parentPathOrId: $parentPathOrId
                name: $name
                primaryNodeType: "jnt:file"
                children: [
                    {
                        name: "jcr:content"
                        primaryNodeType: "jnt:resource"
                        properties: [
                            {name: "jcr:mimeType", value: $mimeType}
                            {name: "jcr:data", value: $data}
                        ]
                    }
                ]
            ) {
                uuid
                path
            }
        }
    }
`;

const DELETE_NODE = gql`
    mutation deleteNode($pathOrId: String!) {
        jcr {
            deleteNode(pathOrId: $pathOrId)
        }
    }
`;

const NODE_EXISTS = gql`
    query nodeExists($path: String!) {
        jcr {
            nodeByPath(path: $path) {
                uuid
            }
        }
    }
`;

/** Creates a node and yields its {uuid, path}. Fails the test if the mutation errors. */
export const addNode = (variables: {
    parentPathOrId: string;
    name: string;
    primaryNodeType: string;
    mixins?: string[];
    properties?: JcrProperty[];
}): Cypress.Chainable<{uuid: string; path: string}> =>
    cy
        .apollo({mutation: ADD_NODE, variables})
        .then((result: {data: {jcr: {addNode: {uuid: string; path: string}}}}) => result.data.jcr.addNode);

/**
 * Attempts to create a node but tolerates a GraphQL error, yielding the raw Apollo result.
 * Used to assert that a CND value constraint rejects a payload at write time.
 */
export const addNodeAllowingErrors = (variables: {
    parentPathOrId: string;
    name: string;
    primaryNodeType: string;
    mixins?: string[];
    properties?: JcrProperty[];
}): Cypress.Chainable<{errors?: unknown[]}> =>
    cy.apollo({mutation: ADD_NODE, variables, errorPolicy: 'all'});

/**
 * Creates a jnt:file with an explicit jcr:mimeType. The mime type is settable here precisely because
 * Jahia does not constrain it server-side, which is what makes it untrusted input for video.jsp.
 */
export const addFile = (variables: {
    parentPathOrId: string;
    name: string;
    mimeType: string;
    data: string;
}): Cypress.Chainable<{uuid: string; path: string}> =>
    cy
        .apollo({mutation: ADD_FILE, variables})
        .then((result: {data: {jcr: {addNode: {uuid: string; path: string}}}}) => result.data.jcr.addNode);

export const deleteNode = (pathOrId: string): Cypress.Chainable =>
    cy.apollo({mutation: DELETE_NODE, variables: {pathOrId}, errorPolicy: 'all'});

/** Removes a node if it is there, so a re-run starts from a clean state. */
export const deleteNodeIfExists = (path: string): Cypress.Chainable =>
    cy.apollo({query: NODE_EXISTS, variables: {path}, errorPolicy: 'all'}).then((result: {data?: {jcr?: {nodeByPath?: {uuid: string} | null}}}) => {
        if (result?.data?.jcr?.nodeByPath?.uuid) {
            return deleteNode(path);
        }

        return cy.wrap(null);
    });

/**
 * Renders one node and yields the HTTP response.
 *
 * failOnStatusCode is deliberately true: a view that throws (e.g. resolving a dangling weakreference)
 * surfaces as a 500 here, so "the request succeeded" is itself one of the assertions.
 */
export const renderNode = (
    nodePath: string,
    options: {workspace?: string; language?: string} = {}
): Cypress.Chainable<Cypress.Response<string>> => {
    const {workspace = 'default', language = 'en'} = options;
    return cy.request({
        url: `/cms/render/${workspace}/${language}${nodePath}.html`,
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
