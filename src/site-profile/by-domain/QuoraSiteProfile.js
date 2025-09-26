import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';
import { hasAnyClass } from '../../html.js';

class QuoraSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('quora.com');
        let config = new DefaultSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
    canElementBeTokenized(element){
        const ignoredTags = [];
        const ignoredIds = [];
        const ignoredClasses = ['qt_read_more'];
        if(this.isIgnoredElement(element, ignoredTags, ignoredIds, ignoredClasses)){
            return false;
        }

        return super.canElementBeTokenized(element);
    }

};

export { QuoraSiteProfile };