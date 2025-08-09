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
        
        const ignoreTargetClasses = ['ytp-time-current', 'ytp-caption-segment', 'captions-text', 'caption-visual-line', 'ytp-tooltip-text'];
        
        if(ignoreTargetClasses.includes(mutation.target.className)) {
            return true;
        }

        if(mutation.target.parentElement){
            const ignoreTargetParentClasses = ['ytp-tooltip-edu'];
            if(ignoreTargetParentClasses.includes(mutation.target.parentElement.className)) {
                return true;
            }
        }
        
        return false;
    }
    
    getTagsNotLog(){
        return super.getTagsNotLog().concat(['YT-FORMATTED-STRING', 'TP-YT-PAPER-BUTTON', 'TP-YT-PAPER-TOOLTIP', 'YT-EPHEMERAL-ACTIONS']);
    }
};

export { YoutubeSiteProfile };