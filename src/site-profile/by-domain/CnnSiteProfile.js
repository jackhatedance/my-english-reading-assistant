import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';

class CnnSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('cnn.com');
        let config = new DefaultSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
    ignoreDomChange(mutation){
        //console.log(mutation);
        const ignoreTags = ['TIME'];
        
        if(ignoreTags.includes(mutation.target.nodeName)) {
            return true;
        }
        
        return false;
    }

    
};

export { CnnSiteProfile };