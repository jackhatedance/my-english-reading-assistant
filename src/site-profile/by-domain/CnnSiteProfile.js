import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';

class CnnSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('cnn.com');
        let config = new DefaultSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
    canElementBeTokenized(element){
        const ignoredTags = [
            'TIME', 
            ];
        const ignoredIds = [];
        const ignoredClasses = ['timestamp__container'];
        
        if(this.isIgnoredElement(element, ignoredTags, ignoredIds, ignoredClasses)){
            return false;
        }

        return super.canElementBeTokenized(element);
    }
};

export { CnnSiteProfile };