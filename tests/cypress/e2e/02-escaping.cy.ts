import {enableModule} from '@jahia/cypress';
import {
    addNode,
    addNodeAllowingErrors,
    BREAKOUT_PAYLOAD,
    CONTENTS_ROOT,
    CONTENT_PATH,
    deleteNodeIfExists,
    expectPayloadEscaped,
    renderNode,
    SITE_KEY,
    TEST_FOLDER
} from '../support/html5';

/**
 * Regression guards for the attribute-injection fixes.
 *
 * The module defends editor-supplied attributes on two layers:
 *   - the sink escapes every interpolated value with fn:escapeXml (element.jsp),
 *   - definitions.cnd constrains attribute *names* to [a-zA-Z0-9-_]+, which escaping cannot do
 *     because escapeXml does not remove whitespace.
 * Both layers are asserted below: values must survive as inert text, names must be rejected at write
 * time. If the CND constraint is ever relaxed, the "rejects" tests below fail and point at the coupling.
 */
describe('HTML5 elements - attribute injection', () => {
    before(() => {
        cy.login();
        enableModule('html5-elements', SITE_KEY);
        deleteNodeIfExists(CONTENT_PATH);
        addNode({
            parentPathOrId: CONTENTS_ROOT,
            name: TEST_FOLDER,
            primaryNodeType: 'jnt:contentFolder'
        });
    });

    after(() => {
        cy.login();
        deleteNodeIfExists(CONTENT_PATH);
    });

    it('escapes elementStyle', () => {
        cy.login();
        const name = 'xss-style';
        addNode({
            parentPathOrId: CONTENT_PATH,
            name,
            primaryNodeType: 'html5nt:div',
            mixins: ['html5mix:elementCustom'],
            properties: [{name: 'elementStyle', value: BREAKOUT_PAYLOAD}]
        });

        renderNode(`${CONTENT_PATH}/${name}`)
            .its('body')
            .should((body: string) => {
                expectPayloadEscaped(body);
                expect(body).to.contain('&#034;&gt;&lt;img');
            });
    });

    it('escapes elementCssClass', () => {
        cy.login();
        const name = 'xss-class';
        addNode({
            parentPathOrId: CONTENT_PATH,
            name,
            primaryNodeType: 'html5nt:div',
            mixins: ['html5mix:elementCustom'],
            properties: [{name: 'elementCssClass', value: BREAKOUT_PAYLOAD}]
        });

        renderNode(`${CONTENT_PATH}/${name}`).its('body').should(expectPayloadEscaped);
    });

    it('escapes elementRole', () => {
        cy.login();
        const name = 'xss-role';
        addNode({
            parentPathOrId: CONTENT_PATH,
            name,
            primaryNodeType: 'html5nt:div',
            mixins: ['html5mix:elementCustom'],
            properties: [{name: 'elementRole', value: BREAKOUT_PAYLOAD}]
        });

        renderNode(`${CONTENT_PATH}/${name}`).its('body').should(expectPayloadEscaped);
    });

    it('escapes elementAria', () => {
        cy.login();
        const name = 'xss-aria';
        addNode({
            parentPathOrId: CONTENT_PATH,
            name,
            primaryNodeType: 'html5nt:div',
            mixins: ['html5mix:elementCustom'],
            properties: [{name: 'elementAria', value: BREAKOUT_PAYLOAD}]
        });

        renderNode(`${CONTENT_PATH}/${name}`).its('body').should(expectPayloadEscaped);
    });

    it('escapes a data attribute value', () => {
        cy.login();
        const name = 'xss-data-value';
        addNode({
            parentPathOrId: CONTENT_PATH,
            name,
            primaryNodeType: 'html5nt:section',
            mixins: ['html5mix:elementData'],
            properties: [
                {name: 'dataName', value: 'safe-name'},
                {name: 'dataValue', value: BREAKOUT_PAYLOAD}
            ]
        });

        renderNode(`${CONTENT_PATH}/${name}`)
            .its('body')
            .should((body: string) => {
                expectPayloadEscaped(body);
                expect(body).to.contain('data-safe-name="&#034;&gt;&lt;img');
            });
    });

    it('renders a valid elementId unchanged', () => {
        cy.login();
        const name = 'id-valid';
        addNode({
            parentPathOrId: CONTENT_PATH,
            name,
            primaryNodeType: 'html5nt:aside',
            mixins: ['html5mix:elementCustom'],
            properties: [{name: 'elementId', value: 'advertisement_block-1'}]
        });

        renderNode(`${CONTENT_PATH}/${name}`)
            .its('body')
            .should((body: string) => {
                expect(body).to.contain('id="advertisement_block-1"');
            });
    });

    it('rejects an elementId that breaks the CND value constraint', () => {
        cy.login();
        addNodeAllowingErrors({
            parentPathOrId: CONTENT_PATH,
            name: 'id-invalid',
            primaryNodeType: 'html5nt:aside',
            mixins: ['html5mix:elementCustom'],
            properties: [{name: 'elementId', value: BREAKOUT_PAYLOAD}]
        }).should((result: {errors?: unknown[]}) => {
            expect(result.errors, 'the [a-zA-Z0-9-_]+ constraint must reject the payload').to.not.be.empty;
        });
    });

    it('rejects a data attribute name that breaks the CND value constraint', () => {
        cy.login();
        addNodeAllowingErrors({
            parentPathOrId: CONTENT_PATH,
            name: 'data-name-invalid',
            primaryNodeType: 'html5nt:section',
            mixins: ['html5mix:elementData'],
            properties: [
                {name: 'dataName', value: 'evil" onmouseover=alert(1) x'},
                {name: 'dataValue', value: 'anything'}
            ]
        }).should((result: {errors?: unknown[]}) => {
            expect(result.errors, 'the [a-zA-Z0-9-_]+ constraint must reject the payload').to.not.be.empty;
        });
    });
});
