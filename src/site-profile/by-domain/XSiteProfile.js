import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';

class XSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('x.com');
        let config = new DefaultSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
    ignoreDomChange(mutation, addedNodeTextContents){
        //console.log(mutation);
        
        let addedNodeTextContentsLength = 0;
        if(addedNodeTextContents){
            addedNodeTextContentsLength = addedNodeTextContents.length;
        }

        //ignore changes of numbers of each twitter. such as reply, repost, etc.
        const minContentChangeSize = 12;

        if(addedNodeTextContentsLength < minContentChangeSize){
            return true;
        }
        
        return super.ignoreDomChange(mutation);
    }

    
};

export { XSiteProfile };