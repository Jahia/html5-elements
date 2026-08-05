import {enableModule} from '@jahia/cypress';
import {
    addNode,
    CONTENTS_ROOT,
    CONTENT_PATH,
    deleteNodeIfExists,
    ELEMENT_TYPES,
    renderNode,
    SITE_KEY,
    startTag,
    TEST_FOLDER
} from '../support/html5';

describe('HTML5 elements - rendered markup', () => {
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

    // One view (html5mix_element/html/element.jsp) serves all 12 node types and recovers the tag name
    // from the primary node type at render time. This loop is what guards that mapping.
    ELEMENT_TYPES.forEach(tag => {
        it(`renders <${tag}> for html5nt:${tag}`, () => {
            cy.login();
            const name = `element-${tag}`;
            addNode({parentPathOrId: CONTENT_PATH, name, primaryNodeType: `html5nt:${tag}`});

            renderNode(`${CONTENT_PATH}/${name}`)
                .its('body')
                .should((body: string) => {
                    expect(body).to.contain(`<${tag}`);
                    expect(body).to.contain(`</${tag}>`);
                });
        });
    });

    it('renders no optional attributes when no mixin is set', () => {
        cy.login();
        const name = 'element-bare';
        addNode({parentPathOrId: CONTENT_PATH, name, primaryNodeType: 'html5nt:section'});

        renderNode(`${CONTENT_PATH}/${name}`)
            .its('body')
            .should((body: string) => {
                // A bare element must render as a plain start tag with no attributes at all.
                expect(startTag(body, 'section')).to.equal('<section>');
            });
    });

    it('renders every html5mix:elementCustom attribute', () => {
        cy.login();
        const name = 'element-custom';
        addNode({
            parentPathOrId: CONTENT_PATH,
            name,
            primaryNodeType: 'html5nt:article',
            mixins: ['html5mix:elementCustom'],
            properties: [
                {name: 'elementId', value: 'my-article'},
                {name: 'elementCssClass', value: 'my-class other-class'},
                {name: 'elementRole', value: 'region'},
                {name: 'elementStyle', value: 'padding:10px'},
                {name: 'elementAria', value: 'Article about guitars'}
            ]
        });

        renderNode(`${CONTENT_PATH}/${name}`)
            .its('body')
            .should((body: string) => {
                expect(body).to.contain('<article');
                expect(body).to.contain('id="my-article"');
                expect(body).to.contain('class="my-class other-class"');
                expect(body).to.contain('role="region"');
                expect(body).to.contain('style="padding:10px"');
                expect(body).to.contain('aria-label="Article about guitars"');
            });
    });

    it('renders all three data attributes', () => {
        cy.login();
        const name = 'element-data';
        addNode({
            parentPathOrId: CONTENT_PATH,
            name,
            primaryNodeType: 'html5nt:section',
            mixins: ['html5mix:elementData', 'html5mix:elementData2', 'html5mix:elementData3'],
            properties: [
                {name: 'dataName', value: 'animal-type'},
                {name: 'dataValue', value: 'bird'},
                {name: 'dataName2', value: 'colour'},
                {name: 'dataValue2', value: 'blue'},
                {name: 'dataName3', value: 'count'},
                {name: 'dataValue3', value: '3'}
            ]
        });

        renderNode(`${CONTENT_PATH}/${name}`)
            .its('body')
            .should((body: string) => {
                expect(body).to.contain('data-animal-type="bird"');
                expect(body).to.contain('data-colour="blue"');
                expect(body).to.contain('data-count="3"');
            });
    });

    it('omits a data attribute when only one half of the name/value pair is filled in', () => {
        cy.login();
        const name = 'element-data-partial';
        addNode({
            parentPathOrId: CONTENT_PATH,
            name,
            primaryNodeType: 'html5nt:section',
            mixins: ['html5mix:elementData'],
            properties: [{name: 'dataName', value: 'orphan'}]
        });

        renderNode(`${CONTENT_PATH}/${name}`)
            .its('body')
            .should((body: string) => {
                expect(body).to.contain('<section');
                expect(body).to.not.contain('data-orphan');
            });
    });
});
