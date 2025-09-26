import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';
import { isLeafTextTag } from '../../html.js';

class YoutubeSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('youtube.com');
        let config = new DefaultSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
    isLeafTextElement(element){
        return isLeafTextTag(element.nodeName, ['YT-FORMATTED-STRING']);
    }
   
    canElementBeTokenized(element){
        const ignoredTags = [
            'TP-YT-PAPER-BUTTON', 'TP-YT-PAPER-TOOLTIP', 'YT-EPHEMERAL-ACTIONS'
            ];
        
        const ignoredIds = [
            'title', //change title will cause issue of unchanged title after video clip changed.
            'top-row', 'full-bleed-container'];
        
        const ignoredClasses = ['ytp-time-current', 'ytp-chapter-container', 'ytp-caption-window-container', 'ytp-tooltip', 'more-button', 'less-button'];
        
        if(this.isIgnoredElement(element, ignoredTags, ignoredIds, ignoredClasses)){
            return false;
        }

        return super.canElementBeTokenized(element);
    }
};

export { YoutubeSiteProfile };