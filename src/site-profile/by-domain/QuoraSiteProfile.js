import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';
import { isTextTag, isSelfOrDecendantOfClass, isSelfOrDecendantOfIds } from '../../html.js';

class QuoraSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('quora.com');
        let config = new DefaultSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
    ignoreDomChange(mutation){
                
        return false;
    }
    

    canBeTokenized(element){
        
        const ignoredClasses = ['qt_read_more'];
        
        if(isSelfOrDecendantOfClass(element, ignoredClasses, 3)) {
            return false;
        }

        return true;
    }
};

export { QuoraSiteProfile };