import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { UrlMatcher } from '../matcher/UrlMatcher.js';
import { IframeDocumentConfig } from '../config/IframeDocumentProfile.js';

class GroupdocsAppViewerEpub extends DefaultSiteProfile {
    constructor() {
        let matcher = new UrlMatcher('https://products.groupdocs.app/viewer/epub');
        let config = new IframeDocumentConfig();
        super(matcher.name, matcher, config);
    }
};

export { GroupdocsAppViewerEpub };