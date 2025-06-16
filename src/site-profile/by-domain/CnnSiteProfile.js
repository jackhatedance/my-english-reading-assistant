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
        for(let node of mutation.addedNodes){
            if(!ignoreTags.includes(node.parentElement.nodeName)) {
                return false;
            }
        }
        return true;
    }

    
};

export { CnnSiteProfile };