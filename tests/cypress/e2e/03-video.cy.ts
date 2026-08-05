import {enableModule} from '@jahia/cypress';
import {
    addFile,
    addNode,
    BREAKOUT_PAYLOAD,
    CONTENTS_ROOT,
    CONTENT_PATH,
    deleteNode,
    deleteNodeIfExists,
    expectPayloadEscaped,
    FILES_PATH,
    FILES_ROOT,
    renderNode,
    SITE_KEY,
    startTag,
    TEST_FOLDER
} from '../support/html5';

const DEFAULT_FALLBACK = 'Your browser does not support the video tag';

describe('HTML5 video - rendered markup', () => {
    before(() => {
        cy.login();
        enableModule('html5-elements', SITE_KEY);
        deleteNodeIfExists(CONTENT_PATH);
        deleteNodeIfExists(FILES_PATH);
        addNode({parentPathOrId: CONTENTS_ROOT, name: TEST_FOLDER, primaryNodeType: 'jnt:contentFolder'});
        addNode({parentPathOrId: FILES_ROOT, name: TEST_FOLDER, primaryNodeType: 'jnt:folder'});
    });

    after(() => {
        cy.login();
        deleteNodeIfExists(CONTENT_PATH);
        deleteNodeIfExists(FILES_PATH);
    });

    it('renders <video> with a <source> pointing at the referenced file', () => {
        cy.login();
        addFile({
            parentPathOrId: FILES_PATH,
            name: 'basic.mp4',
            mimeType: 'video/mp4',
            data: 'not-a-real-video'
        }).then(file => {
            addNode({
                parentPathOrId: CONTENT_PATH,
                name: 'video-basic',
                primaryNodeType: 'html5nt:video',
                properties: [{name: 'source', type: 'WEAKREFERENCE', value: file.uuid}]
            });

            renderNode(`${CONTENT_PATH}/video-basic`)
                .its('body')
                .should((body: string) => {
                    expect(body).to.contain('<video');
                    expect(body).to.contain('</video>');
                    expect(body).to.contain('<source src=');
                    expect(body).to.contain('basic.mp4');
                    expect(body).to.contain('type="video/mp4"');
                });
        });
    });

    // Regression: video.jsp used to resolve the localized default from the resource bundle and then
    // immediately overwrite it with the (empty) node property, so this text never reached the output for
    // a video without the html5mix:videoAdvancedSettings mixin.
    it('renders the localized fallback text when the advanced-settings mixin is absent', () => {
        cy.login();
        addFile({
            parentPathOrId: FILES_PATH,
            name: 'no-mixin.mp4',
            mimeType: 'video/mp4',
            data: 'not-a-real-video'
        }).then(file => {
            addNode({
                parentPathOrId: CONTENT_PATH,
                name: 'video-no-mixin',
                primaryNodeType: 'html5nt:video',
                properties: [{name: 'source', type: 'WEAKREFERENCE', value: file.uuid}]
            });

            renderNode(`${CONTENT_PATH}/video-no-mixin`)
                .its('body')
                .should((body: string) => {
                    expect(body).to.contain('<video');
                    expect(body).to.contain(DEFAULT_FALLBACK);
                });
        });
    });

    it('renders the editor-supplied fallback text and the advanced settings attributes', () => {
        cy.login();
        addFile({
            parentPathOrId: FILES_PATH,
            name: 'advanced.mp4',
            mimeType: 'video/mp4',
            data: 'not-a-real-video'
        }).then(file => {
            addNode({
                parentPathOrId: CONTENT_PATH,
                name: 'video-advanced',
                primaryNodeType: 'html5nt:video',
                mixins: ['html5mix:videoAdvancedSettings'],
                properties: [
                    {name: 'source', type: 'WEAKREFERENCE', value: file.uuid},
                    {name: 'fallbackContent', value: 'Votre navigateur ne gere pas la video'},
                    {name: 'autoplay', value: 'true'},
                    {name: 'controls', value: 'true'},
                    {name: 'loop', value: 'false'},
                    {name: 'muted', value: 'true'},
                    {name: 'preload', value: 'metadata'},
                    {name: 'height', value: '360'},
                    {name: 'width', value: '640'}
                ]
            });

            renderNode(`${CONTENT_PATH}/video-advanced`)
                .its('body')
                .should((body: string) => {
                    expect(body).to.contain('Votre navigateur ne gere pas la video');
                    expect(body).to.not.contain(DEFAULT_FALLBACK);

                    const videoTag = startTag(body, 'video');
                    expect(videoTag).to.contain('autoplay');
                    expect(videoTag).to.contain('controls');
                    expect(videoTag).to.contain('muted');
                    expect(videoTag).to.contain('preload="metadata"');
                    expect(videoTag).to.contain('height="360"');
                    expect(videoTag).to.contain('width="640"');
                    // loop was set to false, so the boolean attribute must be absent
                    expect(videoTag).to.not.contain('loop');
                });
        });
    });

    it('escapes the fallback content', () => {
        cy.login();
        addFile({
            parentPathOrId: FILES_PATH,
            name: 'xss-fallback.mp4',
            mimeType: 'video/mp4',
            data: 'not-a-real-video'
        }).then(file => {
            addNode({
                parentPathOrId: CONTENT_PATH,
                name: 'video-xss-fallback',
                primaryNodeType: 'html5nt:video',
                mixins: ['html5mix:videoAdvancedSettings'],
                properties: [
                    {name: 'source', type: 'WEAKREFERENCE', value: file.uuid},
                    {name: 'fallbackContent', value: BREAKOUT_PAYLOAD}
                ]
            });

            renderNode(`${CONTENT_PATH}/video-xss-fallback`).its('body').should(expectPayloadEscaped);
        });
    });

    // The picker's mime='video/*' restriction is a UI filter only: jcr:mimeType is whatever the upload
    // path stored, so video.jsp must treat it as untrusted.
    it('escapes the jcr:mimeType rendered into <source type="...">', () => {
        cy.login();
        addFile({
            parentPathOrId: FILES_PATH,
            name: 'xss-mime.mp4',
            mimeType: `video/mp4${BREAKOUT_PAYLOAD}`,
            data: 'not-a-real-video'
        }).then(file => {
            addNode({
                parentPathOrId: CONTENT_PATH,
                name: 'video-xss-mime',
                primaryNodeType: 'html5nt:video',
                properties: [{name: 'source', type: 'WEAKREFERENCE', value: file.uuid}]
            });

            renderNode(`${CONTENT_PATH}/video-xss-mime`).its('body').should(expectPayloadEscaped);
        });
    });

    // Regression: 'source' is mandatory but a weakreference, so it carries no referential integrity.
    // Deleting the target file makes ${source.node} throw ItemNotFoundException, which used to fail the
    // whole fragment with a 500. The node is rendered only AFTER the deletion so no cached fragment from
    // an earlier render can mask the behaviour.
    it('degrades instead of failing when the source file has been deleted', () => {
        cy.login();
        addFile({
            parentPathOrId: FILES_PATH,
            name: 'to-delete.mp4',
            mimeType: 'video/mp4',
            data: 'not-a-real-video'
        }).then(file => {
            addNode({
                parentPathOrId: CONTENT_PATH,
                name: 'video-dangling-source',
                primaryNodeType: 'html5nt:video',
                properties: [{name: 'source', type: 'WEAKREFERENCE', value: file.uuid}]
            });

            deleteNode(file.path);

            renderNode(`${CONTENT_PATH}/video-dangling-source`).should(response => {
                expect(response.status, 'a dangling reference must not fail the fragment').to.equal(200);
                expect(response.body).to.not.contain('<video');
                expect(response.body).to.not.contain('<source');
            });
        });
    });

    it('drops the poster attribute when the poster file has been deleted', () => {
        cy.login();
        addFile({
            parentPathOrId: FILES_PATH,
            name: 'keep.mp4',
            mimeType: 'video/mp4',
            data: 'not-a-real-video'
        }).then(sourceFile => {
            addFile({
                parentPathOrId: FILES_PATH,
                name: 'poster-to-delete.jpg',
                mimeType: 'image/jpeg',
                data: 'not-a-real-image'
            }).then(posterFile => {
                addNode({
                    parentPathOrId: CONTENT_PATH,
                    name: 'video-dangling-poster',
                    primaryNodeType: 'html5nt:video',
                    mixins: ['html5mix:videoAdvancedSettings'],
                    properties: [
                        {name: 'source', type: 'WEAKREFERENCE', value: sourceFile.uuid},
                        {name: 'poster', type: 'WEAKREFERENCE', value: posterFile.uuid}
                    ]
                });

                deleteNode(posterFile.path);

                renderNode(`${CONTENT_PATH}/video-dangling-poster`).should(response => {
                    expect(response.status).to.equal(200);
                    expect(response.body).to.contain('<video');
                    expect(startTag(response.body, 'video')).to.not.contain('poster=');
                });
            });
        });
    });

    it('renders the poster attribute when the poster file exists', () => {
        cy.login();
        addFile({
            parentPathOrId: FILES_PATH,
            name: 'with-poster.mp4',
            mimeType: 'video/mp4',
            data: 'not-a-real-video'
        }).then(sourceFile => {
            addFile({
                parentPathOrId: FILES_PATH,
                name: 'poster.jpg',
                mimeType: 'image/jpeg',
                data: 'not-a-real-image'
            }).then(posterFile => {
                addNode({
                    parentPathOrId: CONTENT_PATH,
                    name: 'video-with-poster',
                    primaryNodeType: 'html5nt:video',
                    mixins: ['html5mix:videoAdvancedSettings'],
                    properties: [
                        {name: 'source', type: 'WEAKREFERENCE', value: sourceFile.uuid},
                        {name: 'poster', type: 'WEAKREFERENCE', value: posterFile.uuid}
                    ]
                });

                renderNode(`${CONTENT_PATH}/video-with-poster`)
                    .its('body')
                    .should((body: string) => {
                        const videoTag = startTag(body, 'video');
                        expect(videoTag).to.contain('poster=');
                        expect(videoTag).to.contain('poster.jpg');
                    });
            });
        });
    });
});
