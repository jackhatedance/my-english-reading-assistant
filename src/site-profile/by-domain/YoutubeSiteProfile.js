import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';
import { isLeafTextTag, isSelfOrDecendantOfClass, isSelfOrDecendantOfIds, hasAnyId, hasAnyClass } from '../../html.js';

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
        
        const ignoredIds = ['title'];
        if(isSelfOrDecendantOfIds(mutation.target, ignoredIds, 5)) {
            return true;
        }

        const ignoredClasses = ['ytp-time-current', 'ytp-chapter-container', 'ytp-caption-window-container', 'ytp-tooltip'];
        
        if(isSelfOrDecendantOfClass(mutation.target, ignoredClasses, 5)) {
            return true;
        }

        
        return false;
    }
    
    getTagsNotLog(){
        return super.getTagsNotLog().concat(['TP-YT-PAPER-BUTTON', 'TP-YT-PAPER-TOOLTIP', 'YT-EPHEMERAL-ACTIONS']);
    }

    isLeafTextElement(element){
        return isLeafTextTag(element.nodeName, ['YT-FORMATTED-STRING']);
    }

    canElementBeTokenized(element){
        const ignoredIds = ['title', 'top-row'];
        if(hasAnyId(element, ignoredIds)) {
            return false;
        }
        const ignoredClasses = ['more-button', 'less-button', 'yt-lockup-metadata-view-model__heading-reset'];
        if(hasAnyClass(element, ignoredClasses)){
            return false;
        }

        return super.canElementBeTokenized(element);
    }
};

export { YoutubeSiteProfile };