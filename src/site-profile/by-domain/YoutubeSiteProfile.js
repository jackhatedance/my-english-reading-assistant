import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';

class YoutubeSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('youtube.com');
        let config = new DefaultSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
    ignoreDomChange(mutation){
        //console.log(mutation);
        //console.log('youtube ignore');

        //ignore time and caption(subtitle)
        const ignoreTargetClasses = ['ytp-time-current', 'ytp-caption-segment', 'captions-text', 'caption-visual-line'];
        
        if(!ignoreTargetClasses.includes(mutation.target.className)) {
            return false;
        }
        
        return true;
    }

    
};

export { YoutubeSiteProfile };