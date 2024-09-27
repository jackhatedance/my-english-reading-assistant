import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { UrlMatcher } from '../matcher/UrlMatcher.js';
import { IframeSiteConfig } from '../config/IframeSiteConfig.js';

class GroupdocsAppViewerEpub extends DefaultSiteProfile {
    constructor() {
        let matcher = new UrlMatcher('https://products.groupdocs.app/viewer/epub');
        let config = new IframeSiteConfig();
        super(matcher.name, matcher, config);
    }
};

export { GroupdocsAppViewerEpub };