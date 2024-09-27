import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { IframeSiteConfig } from '../config/IframeDocumentProfile.js';


class NoteYoudaoSiteConfig extends IframeSiteConfig {
    matchIframe(iframe){
        let id = iframe.id;
        return id && id.startsWith('content-body');
    }
}

class NoteYoudaoSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('note.youdao.com');
        let config = new NoteYoudaoSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
};

export { NoteYoudaoSiteProfile };