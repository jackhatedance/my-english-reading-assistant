import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { IframeDocumentConfig } from '../config/IframeDocumentProfile.js';


class NoteYoudaoDocumentConfig extends IframeDocumentConfig {
    matchIframe(iframe){
        let id = iframe.id;
        return id && id.startsWith('content-body');
    }
}

class NoteYoudaoSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('note.youdao.com');
        let config = new NoteYoudaoDocumentConfig();
        super(matcher.name, matcher, config);
    } 
    
};

export { NoteYoudaoSiteProfile };