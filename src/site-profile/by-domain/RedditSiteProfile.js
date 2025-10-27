import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';
import { generateCssRules as commonGenerateCssRules } from '../../style.js';
import { isLeafTextTag } from '../../html.js';

class RedditSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('reddit.com');
        let config = new DefaultSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
    generateCssRules(options) {


        let extraStyle = 'visibility: visible !important;';
        let rules = commonGenerateCssRules(options, extraStyle);
        return rules;
    }

    isLeafTextElement(element){
        return isLeafTextTag(element.nodeName, ['FACEPLATE-SCREEN-READER-CONTENT', 'FACEPLATE-NUMBER', 'GAMES-SECTION-BADGE-WRAPPER', 'SHREDDIT-DYNAMIC-AD-LINK']);
    }
};

export { RedditSiteProfile };